# 🚀 HealthAI - Quick Start Guide (Hackathon Edition)

## ✅ What's Already Built

### 1. **Landing Page** ✓
- Futuristic gradient title
- "Get Started" button
- Dark/Light mode support

### 2. **Dashboard** ✓
- 8 feature cards with icons
- Responsive grid layout
- Navigation to all features

### 3. **Chatbot** ✓
- Floating heart button (bottom right)
- AI-powered health Q&A
- Expandable window

### 4. **Prescription Analyzer** ✓
- Image upload
- OCR text extraction (Tesseract.js)
- AI analysis with Gemini

### 5. **Theme System** ✓
- Dark/Light mode
- Futuristic CSS with glassmorphism
- Context-based theme switching

---

## 🔧 Setup (3 Steps)

### Step 1: Get Free API Key
```
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Create new API key
4. Copy the key
5. Edit: .env.local
6. Paste: VITE_GEMINI_API_KEY=your_key_here
```

### Step 2: Install Dependencies (if needed)
```powershell
cd c:\Users\DELL\Desktop\health-management-site
node node_modules/npm/bin/npm-cli.js install
```

### Step 3: Start Dev Server
```powershell
node node_modules/vite/bin/vite.js
```
Open: **http://localhost:3001**

---

## 📱 Test the App

1. **Landing Page**: Click "Get Started"
2. **Dashboard**: See all 8 features
3. **Chatbot**: Click ❤️ button (bottom right)
   - Ask: "What are symptoms of flu?"
4. **Prescription**: Click prescription icon (coming soon)

---

## 🎯 Next Features (Priority Order)

### Priority 1: Report Analyzer
**Time: 30 minutes**

Create: `src/components/report/ReportAnalyzer.jsx`
```jsx
// Copy from PrescriptionAnalyzer.jsx and modify:
// - Change title to "📋 Report Analyzer"
// - Use aiService.analyzeMedicalReport() instead
// - Change instructions text
```

Add route to `App.jsx`:
```jsx
import ReportAnalyzer from './components/report/ReportAnalyzer';

<Route path="/report" element={<ReportAnalyzer />} />
```

### Priority 2: Disease Detection (Symptom Checker)
**Time: 1 hour**

Create: `src/components/disease-detection/DiseaseDetection.jsx`
```jsx
// Features:
// - List of symptoms with checkboxes
// - Freeform text area for custom symptoms
// - Button to analyze
// - Display urgency level (routine/soon/emergency)
// - Use aiService.checkSymptoms()
```

### Priority 3: BP Monitor (Camera-based)
**Time: 1.5 hours**

Create: `src/components/bp-monitor/BPMonitor.jsx`
```jsx
// Features:
// - Use react-webcam for camera
// - Show live video feed
// - Simulate vitals detection
// - Display HR with animated chart
// - Save readings to localStorage
```

### Priority 4: Health Monitor (Wearable Dashboard)
**Time: 1 hour**

Create: `src/components/health-monitor/HealthMonitor.jsx`
```jsx
// Features:
// - Line chart with Recharts
// - Show mock vitals (BP, HR, SpO2)
// - Trend analysis with AI
// - Daily/Weekly/Monthly views
```

### Priority 5-8: Other Features
- Mental Health Support (Chat interface)
- Hospital Coordination (Bed status mock API)
- Rural Healthcare (Offline-first guide)
- (Budget remaining time)

---

## 🎨 Customizing Colors

Edit: `src/context/ThemeContext.jsx`

**Dark Mode Colors:**
```javascript
cyan: '#00d4ff',      // Cyan glow
purple: '#7c3aed',    // Purple glow
pink: '#ec4899',      // Pink accents
red: '#ef4444',       // Error/urgent
green: '#10b981',     // Success
orange: '#f59e0b',    // Warning
blue: '#3b82f6'       // Info
```

Change any color:
```javascript
cyan: '#ff00ff'  // Change to magenta
```

---

## 🔑 Important Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routes & main app structure |
| `src/context/ThemeContext.jsx` | Dark/Light mode logic |
| `src/styles/globals.css` | Futuristic styling |
| `src/services/health-ai/aiService.js` | AI functions |
| `src/services/ocr/ocrService.js` | Text extraction |
| `.env.local` | API keys (KEEP SECRET!) |

---

## 💡 Quick Code Template

**Create new feature component:**

```jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const FeatureName = () => {
  const theme = useTheme();
  const [state, setState] = useState('');

  return (
    <div style={{
      backgroundColor: theme.colors.bg.primary,
      color: theme.colors.text.primary,
      minHeight: '100vh',
      padding: '40px 20px',
    }}>
      <h1 style={{
        background: `linear-gradient(135deg, ${theme.colors.accent.cyan}, ${theme.colors.accent.purple})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '2.5rem',
      }}>
        🎯 Feature Name
      </h1>
      {/* Your content */}
    </div>
  );
};

export default FeatureName;
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **App won't load** | Check API key in `.env.local` |
| **Chatbot no response** | Verify Gemini API key is valid |
| **OCR very slow** | Compress image before upload |
| **Port already in use** | Kill process: `lsof -ti:3001 \| xargs kill -9` |
| **Changes not showing** | Restart dev server |

---

## 📊 Project Structure

```
health-management-site/
├── src/
│   ├── components/          (React components)
│   │   ├── dashboard/       (✓ Done)
│   │   ├── prescription/    (✓ Done)
│   │   ├── chatbot/        (✓ Done)
│   │   ├── report/         (TODO)
│   │   └── ...
│   ├── services/           (Business logic)
│   │   ├── health-ai/      (✓ Done - aiService)
│   │   └── ocr/            (✓ Done - ocrService)
│   ├── context/            (Global state)
│   │   └── ThemeContext.jsx (✓ Done)
│   ├── styles/             (CSS)
│   │   └── globals.css     (✓ Done - futuristic)
│   └── App.jsx             (✓ Done - routes)
├── .env.local              (API keys - ADD YOUR KEY)
├── vite.config.js          (Vite config)
└── package.json            (Dependencies)
```

---

## 🎯 Hackathon Checklist

- [ ] API key configured in `.env.local`
- [ ] App runs without errors
- [ ] Landing page loads
- [ ] Dashboard shows all cards
- [ ] Chatbot responds (with valid API key)
- [ ] Prescription analyzer works
- [ ] Report analyzer added
- [ ] Disease detection added
- [ ] BP monitor added
- [ ] Dark/Light mode works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] README.md updated
- [ ] GitHub repo created

---

## 🚀 Deployment (Later)

```bash
# Build for production
npm run build

# Deploy to Vercel (free)
npm install -g vercel
vercel

# Or deploy to Netlify
# Just connect your GitHub repo
```

---

## 📞 API Reference

### aiService Functions
```javascript
// Analyze prescription
await aiService.analyzePrescription(extractedText)

// Analyze medical report
await aiService.analyzeMedicalReport(reportText)

// Check symptoms
await aiService.checkSymptoms(symptoms)

// Health chatbot
await aiService.chatbotResponse(userMessage, context)

// Generate insights
await aiService.generateHealthInsight(healthData)
```

### ocrService Functions
```javascript
// Extract text from image file
await ocrService.extractText(imageFile)

// Extract from URL
await ocrService.extractTextFromUrl(imageUrl)

// Process prescription
await ocrService.processPrescription(imageFile)

// Process report
await ocrService.processMedicalReport(imageFile)
```

---

## 🎓 Learning Resources

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Gemini API**: https://ai.google.dev
- **Tesseract OCR**: https://tesseract-ocr.github.io/
- **Recharts**: https://recharts.org/

---

## ⏱️ Estimated Timeline

- **Today**: Setup + Prescription + Report (2-3 hours)
- **Day 2**: Disease Detection + BP Monitor (2-3 hours)
- **Day 3**: Health Monitor + Polish + Testing (2-3 hours)
- **Day 4**: Mental Health + Hospital Coord + Rural (3-4 hours)
- **Day 5**: Final polish, testing, documentation

---

## 🎉 You're All Set!

Your hackathon health management system is ready to go. Start by:

1. ✅ Adding your API key to `.env.local`
2. ✅ Testing the Chatbot
3. ✅ Building the Report Analyzer
4. ✅ Adding more features one by one

**Good luck with your hackathon! 🚀**

---

**Need Help?** Check `IMPLEMENTATION_GUIDE.md` for detailed feature guides.
