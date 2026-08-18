import { ppgEngine } from '../../src/services/health-ai/ppgBiomarkerEngine.js';

function trainAndCalibrate() {
  console.log('Running Automatic Model Training & Ridge Calibration (N = 500)...');
  
  const samples = [];
  const cohorts = [
    { ageRange: [18, 35], sbpRange: [105, 122], dbpRange: [65, 78], hrRange: [58, 78], count: 150 },
    { ageRange: [36, 55], sbpRange: [115, 128], dbpRange: [72, 84], hrRange: [62, 85], count: 150 },
    { ageRange: [40, 75], sbpRange: [130, 165], dbpRange: [85, 102], hrRange: [68, 95], count: 120 },
    { ageRange: [65, 85], sbpRange: [135, 175], dbpRange: [70, 92], hrRange: [60, 88], count: 80 }
  ];

  for (const group of cohorts) {
    for (let i = 0; i < group.count; i++) {
      const age = Math.round(group.ageRange[0] + Math.random() * (group.ageRange[1] - group.ageRange[0]));
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const isMale = gender === 'male';
      const trueHr = Math.round(group.hrRange[0] + Math.random() * (group.hrRange[1] - group.hrRange[0]));
      const trueSbp = Math.round(group.sbpRange[0] + Math.random() * (group.sbpRange[1] - group.sbpRange[0]));
      const trueDbp = Math.round(group.dbpRange[0] + Math.random() * (group.dbpRange[1] - group.dbpRange[0]));

      ppgEngine.reset();
      const fs = 30;
      const durationSec = 6.0;
      const totalFrames = fs * durationSec;
      const hrHz = trueHr / 60;
      const riseFraction = Math.max(0.08, 0.18 - (trueSbp - 110) * 0.0012);
      const dicroticRatio = Math.max(0.15, 0.35 - (age - 20) * 0.003);

      for (let f = 0; f < totalFrames; f++) {
        const t = f / fs;
        const phase = (t * hrHz) % 1.0;
        let ppgWave;
        if (phase < riseFraction) {
          ppgWave = Math.sin((phase / riseFraction) * (Math.PI / 2));
        } else {
          const decayPhase = (phase - riseFraction) / (1.0 - riseFraction);
          const mainDecay = Math.exp(-decayPhase * 2.8);
          const dicroticPeak = dicroticRatio * Math.exp(-Math.pow((decayPhase - 0.45) / 0.15, 2));
          ppgWave = mainDecay + dicroticPeak;
        }
        const r = 185 + ppgWave * 25 + (Math.random() - 0.5) * 0.8;
        const g = 90 - ppgWave * 35 + (Math.random() - 0.5) * 1.0;
        const b = 65;
        ppgEngine.ingestFrame(r, g, b, t * 1000);
      }

      // Feature extraction from smoothed buffer
      const smoothed = ppgEngine.getSmoothedSignal();
      const { peaks, troughs } = ppgEngine.detectPeaksAndTroughs(smoothed);

      let extractedRiseTime = 0.14;
      if (peaks.length > 0 && troughs.length > 0) {
        const riseTimes = [];
        for (let p of peaks) {
          const prevTrough = [...troughs].reverse().find(t => t.exactIdx < p.exactIdx);
          if (prevTrough) {
            const dur = (p.exactIdx - prevTrough.exactIdx) / 30;
            if (dur > 0.04 && dur < 0.45) riseTimes.push(dur);
          }
        }
        if (riseTimes.length > 0) extractedRiseTime = riseTimes.reduce((a, b) => a + b, 0) / riseTimes.length;
      }

      const ageDelta = Math.max(0, age - 20);

      samples.push({
        trueSbp,
        trueDbp,
        ageDelta,
        isMale: isMale ? 1 : 0,
        hrDelta: trueHr - 70,
        riseTime: extractedRiseTime
      });
    }
  }

  // Linear regression fit
  // Target: y = w0 + w1*hrDelta + w2*ageDelta + w3*isMale + w4*(1/riseTime)
  console.log(`Extracted ${samples.length} feature vectors. Average extracted rise time: ${(samples.reduce((a,b)=>a+b.riseTime,0)/samples.length).toFixed(3)}s`);

  // Solve normal equations for SBP and DBP
  const solveOLS = (targetKey) => {
    // X matrix: [1, hrDelta, ageDelta, isMale, 1/riseTime]
    const X = samples.map(s => [1, s.hrDelta, s.ageDelta, s.isMale, 1 / s.riseTime]);
    const Y = samples.map(s => s[targetKey]);
    const numFeatures = 5;

    // XT * X
    const XTX = Array.from({ length: numFeatures }, () => Array(numFeatures).fill(0));
    const XTY = Array(numFeatures).fill(0);

    for (let i = 0; i < samples.length; i++) {
      const row = X[i];
      const y = Y[i];
      for (let r = 0; r < numFeatures; r++) {
        XTY[r] += row[r] * y;
        for (let c = 0; c < numFeatures; c++) {
          XTX[r][c] += row[r] * row[c];
        }
      }
    }

    // Add small ridge regularization
    for (let d = 0; d < numFeatures; d++) XTX[d][d] += 0.001;

    // Gauss-Jordan elimination
    const A = XTX.map((row, i) => [...row, XTY[i]]);
    for (let i = 0; i < numFeatures; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < numFeatures; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }
      [A[i], A[maxRow]] = [A[maxRow], A[i]];

      for (let k = i + 1; k < numFeatures; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j <= numFeatures; j++) {
          if (i === j) A[k][j] = 0;
          else A[k][j] += c * A[i][j];
        }
      }
    }

    const weights = Array(numFeatures).fill(0);
    for (let i = numFeatures - 1; i >= 0; i--) {
      weights[i] = A[i][numFeatures] / A[i][i];
      for (let k = i - 1; k >= 0; k--) {
        A[k][numFeatures] -= A[k][i] * weights[i];
      }
    }

    return weights;
  };

  const sbpWeights = solveOLS('trueSbp');
  const dbpWeights = solveOLS('trueDbp');

  console.log('\n🎯 TRAINED OPTIMAL SBP WEIGHTS:');
  console.log(`   Intercept: ${sbpWeights[0].toFixed(3)}`);
  console.log(`   HR Delta Coeff: ${sbpWeights[1].toFixed(3)}`);
  console.log(`   Age Delta Coeff: ${sbpWeights[2].toFixed(3)}`);
  console.log(`   Gender Male Offset: ${sbpWeights[3].toFixed(3)}`);
  console.log(`   Inv RiseTime (1/Tr) Coeff: ${sbpWeights[4].toFixed(3)}`);

  console.log('\n🎯 TRAINED OPTIMAL DBP WEIGHTS:');
  console.log(`   Intercept: ${dbpWeights[0].toFixed(3)}`);
  console.log(`   HR Delta Coeff: ${dbpWeights[1].toFixed(3)}`);
  console.log(`   Age Delta Coeff: ${dbpWeights[2].toFixed(3)}`);
  console.log(`   Gender Male Offset: ${dbpWeights[3].toFixed(3)}`);
  console.log(`   Inv RiseTime (1/Tr) Coeff: ${dbpWeights[4].toFixed(3)}`);
}

trainAndCalibrate();
