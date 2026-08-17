/**
 * TitanVitals Comprehensive Clinical & Conversational Intelligence Engine
 * Covers 50+ Medical, Physiological, Dietary, Medication, Telemetry & Conversational Domains
 * Supports English, Tamil (தமிழ்), and Hindi (हिन्दी)
 */

export const getTrainedResponse = (userMessage, language = 'English', history = []) => {
  const msg = userMessage.trim().toLowerCase();

  // Helper: check if message contains any of the keywords/phrases
  const matches = (keywords) => keywords.some(k => msg.includes(k));

  // ==========================================
  // 1. CONVERSATIONAL & SOCIAL INTENTS
  // ==========================================

  // Greetings
  if (/^(hi|hello|hey|heyy|heya|yo|howdy|sup|greetings|good\s*morning|good\s*afternoon|good\s*day|vanakkam|namaste|வணக்கம்|नमस्ते)\b/i.test(msg) || msg === 'hi' || msg === 'hello' || msg === 'hey') {
    if (language === 'Tamil') {
      return `வணக்கம்! நான் உங்கள் டைட்டன்வைட்டல்ஸ் AI மருத்துவ உதவியாளர். 😊\n\nஉங்களுக்கு பின்வரும் தலைப்புகளில் நான் உதவ முடியும்:\n• இரத்த அழுத்தம் (BP) & இதய துடிப்பு பரிசோதனை\n• காய்ச்சல், தலைவலி, சளி போன்ற அறிகுறிகள்\n• ஆரோக்கியமான உணவு முறை & உடற்பயிற்சி\n• மருந்து விவரங்கள் & அவசர முதலுதவி\n\nஇன்று உங்கள் உடல்நலம் பற்றி என்ன தெரிந்து கொள்ள வேண்டும்?`;
    }
    if (language === 'Hindi') {
      return `नमस्ते! मैं आपका टाइटनवाइटल्स AI स्वास्थ्य सहायक हूँ। 😊\n\nमैं आपकी निम्नलिखित विषयों में सहायता कर सकता हूँ:\n• रक्तचाप (BP) और हृदय गति की जांच\n• बुखार, सिरदर्द, खांसी आदि के लक्षण\n• संतुलित आहार और फिटनेस सलाह\n• दवाइयों की जानकारी और प्राथमिक उपचार\n\nआज मैं आपके स्वास्थ्य में क्या सहायता कर सकता हूँ?`;
    }
    return `Hello! 👋 I am **TitanVitals AI**, your comprehensive clinical & wellness assistant.\n\nI can help you with:\n• **Vital Telemetry:** BP, Heart Rate, SpO2 & Glucose guidelines\n• **Symptom Assessment:** Fever, headaches, respiratory or digestive issues\n• **Nutrition & Fitness:** Clinical diets, hydration goals & exercise routines\n• **Medication & First Aid:** Common OTC safety & immediate home care\n\nHow are you feeling today, or what medical topic would you like to explore?`;
  }

  // Good Night / Sleep / Bedtime / Farewells
  if (/\b(good\s*nigh?t|good\s*nigt|good\s*nite|gud\s*nyt|gn|bye|goodbye|cya|see\s*you|sleep\s*well|going\s*to\s*sleep|take\s*care|தூங்க|இரவு\s*வணக்கம்|शुभ\s*रात्रि|अलविदा)\b/i.test(msg)) {
    if (language === 'Tamil') {
      return `இனிய இரவு வணக்கம்! 🌙\n\nஆழ்ந்து நிம்மதியாக உறங்குங்கள். 7 முதல் 8 மணி நேர நல்ல உறக்கம் உங்கள் இதய துடிப்பை சீராக்கி, இரத்த அழுத்தத்தை கட்டுக்குள் வைக்கவும், நோய் எதிர்ப்பு சக்தியை அதிகரிக்கவும் உதவுகிறது.\n\nகாலை எழுந்தவுடன் உங்கள் வாஸ்குலர் அளவீடுகளை டைட்டன்வைட்டல்ஸ் மூலம் கண்காணிக்கலாம். Sweet dreams!`;
    }
    if (language === 'Hindi') {
      return `शुभ रात्रि! 🌙\n\nआरामदायक और गहरी नींद लें। प्रतिदिन 7-8 घंटे की पर्याप्त नींद आपके हृदय को स्वस्थ रखने, तनाव को घटाने और प्रतिरक्षा प्रणाली को मजबूत करने के लिए आवश्यक है।\n\nकल सुबह उठकर आप टाइटनवाइटल्स से अपने वाइटल्स जांच सकते हैं। शुभ रात्रि!`;
    }
    return `Good night! 🌙 Wishing you restful, deep, and restorative sleep.\n\n**Quick Bedtime Wellness Tips:**\n• Ensure your bedroom is cool and completely dark for optimal melatonin production.\n• Avoid bright mobile/screen light 30 minutes before bed.\n• 7–8 hours of quality sleep directly lowers resting cardiovascular stress.\n\nRest well, and feel free to log your morning BP and heart rate tomorrow!`;
  }

  // Gratitude / Thanks
  if (/\b(thanks?|tanks|thank\s*you|thx|tq|tysm|nandri|dhanyawad|நன்றி|धन्यवाद)\b/i.test(msg)) {
    if (language === 'Tamil') {
      return `மிக்க மகிழ்ச்சி! 😊 உங்கள் உடல்நலனை எப்போதும் சிறப்பாக கவனித்துக் கொள்ளுங்கள். ஏதேனும் சந்தேகங்கள் இருந்தால் 24 மணி நேரமும் நான் உதவ தயாராக உள்ளேன். நலமுடன் வாழுங்கள்!`;
    }
    if (language === 'Hindi') {
      return `आपका बहुत-बहुत स्वागत है! 😊 अपने स्वास्थ्य का ध्यान रखें। किसी भी समय स्वास्थ्य संबंधी सवाल के लिए मैं 24/7 उपस्थित हूँ। स्वस्थ रहें!`;
    }
    return `You're very welcome! 😊 It's my pleasure to support your health journey.\n\nRemember: Staying consistent with daily hydration, balanced nutrition, and vitals monitoring is the best foundation for long-term health. Take care!`;
  }

  // How are you
  if (/\b(how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do|how\s*is\s*it\s*going|eppadi\s*iruk|kaise\s*ho)\b/i.test(msg)) {
    if (language === 'Tamil') {
      return `நான் மிக நலமாக உள்ளேன், கேட்டதற்கு நன்றி! 😊 உங்கள் ஆரோக்கியத்தை கண்காணிக்க முழு தயார் நிலையில் உள்ளேன். நீங்கள் இன்று எப்படி உணர்கிறீர்கள்?`;
    }
    if (language === 'Hindi') {
      return `मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! 😊 आपके स्वास्थ्य की देखभाल के लिए मैं पूरी तरह तैयार हूँ। आप आज कैसा महसूस कर रहे हैं?`;
    }
    return `I'm doing wonderfully, thank you for asking! 😊 I'm operating at peak performance and ready to assist with symptom analysis, nutrition guidance, or vital checks. How is your body feeling today?`;
  }

  // Acknowledgments
  if (/^(ok|okay|alright|got\s*it|sure|cool|fine|understood|k|yes|yep|no|nope|சரி|ठीक\s*है)\b/i.test(msg) || msg === 'ok' || msg === 'okay' || msg === 'k') {
    if (language === 'Tamil') {
      return `சரிங்க! 👍 வேறு ஏதேனும் உடல்நல கேள்விகள், உணவு முறை அல்லது மருந்து சந்தேகங்கள் உள்ளதா?`;
    }
    if (language === 'Hindi') {
      return `बिल्कुल! 👍 क्या आपके पास कोई अन्य स्वास्थ्य, आहार या लक्षणों से जुड़ा प्रश्न है?`;
    }
    return `Understood! 👍 Let me know if you have any follow-up questions or want to explore other health topics.`;
  }

  // Identity / Capabilities
  if (matches(['who are you', 'what can you do', 'your name', 'about you', 'யார் நீ', 'நீ என்ன செய்வாய்', 'आप कौन हैं', 'आप क्या कर सकते हैं'])) {
    if (language === 'Tamil') {
      return `நான் **TitanVitals AI**, உங்கள் தனிப்பட்ட மருத்துவ மற்றும் ஆரோக்கிய வழிகாட்டி.\n\n**என் திறன்கள்:**\n1. இரத்த அழுத்தம் (BP), நாடித்துடிப்பு (Pulse) மற்றும் SpO2 அளவீடுகளை விளக்குதல்.\n2. காய்ச்சல், தலைவலி, இருமல் போன்ற அறிகுறிகளை பகுப்பாய்வு செய்து முதல் உதவி வழங்குதல்.\n3. இதய நல உணவு முறை, எடை குறைப்பு மற்றும் நீரேற்ற வழிகாட்டிகள்.\n4. மன அழுத்தம், பதட்டம் மற்றும் தூக்கமின்மைக்கான சுவாச பயிற்சிகள்.\n5. தமிழ், ஆங்கிலம் மற்றும் ஹிந்தியில் 24/7 மருத்துவ வழிகாட்டுதல்.`;
    }
    if (language === 'Hindi') {
      return `मैं **TitanVitals AI** हूँ, आपका व्यक्तिगत स्वास्थ्य और क्लिनिकल सहायक।\n\n**मेरी मुख्य विशेषताएं:**\n1. रक्तचाप (BP), पल्स और SpO2 स्तरों का विश्लेषण।\n2. बुखार, सिरदर्द और अन्य लक्षणों के आधार पर स्वास्थ्य सलाह।\n3. दिल के लिए स्वस्थ आहार, वजन नियंत्रण और पोषण गाइड।\n4. तनाव, चिंता और अनिद्रा के लिए विश्राम तकनीकें।\n5. हिन्दी, अंग्रेजी और तमिल में 24/7 मार्गदर्शन।`;
    }
    return `I am **TitanVitals AI**, an interactive next-generation clinical decision support and wellness intelligence assistant modeled after top-tier medical AI systems.\n\n**Key Capabilities:**\n• **Vital Telemetry Analysis:** Real-time interpretation of BP, SpO2, Heart Rate, and Blood Glucose.\n• **Symptom Triage:** Evidence-based differential guidance for common ailments.\n• **Personalized Nutrition & Fitness:** DASH diets, cardio regimens, and hydration tracking.\n• **Mental Health & Sleep Hygiene:** Clinical vagus nerve stimulation (4-7-8 breathing) and circadian optimization.\n• **Multilingual Support:** Fluent in English, Tamil (தமிழ்), and Hindi (हिन्दी).`;
  }

  // ==========================================
  // 2. CARDIOVASCULAR & VITALS DOMAIN
  // ==========================================

  // Blood Pressure
  if (matches(['bp', 'blood pressure', 'hypertension', 'hypotension', 'systolic', 'diastolic', 'இரத்த அழுத்தம்', 'ரத்த அழுத்தம்', 'रक्तचाप', 'बीपी'])) {
    if (language === 'Tamil') {
      return `### 💓 இரத்த அழுத்தம் (Blood Pressure) முழு வழிகாட்டி\n\n**நிலையான அளவீடுகள்:**\n• **சாதாரண அளவு (Normal):** 120/80 mmHg-க்கு கீழ்\n• **அதிகரித்த நிலை (Elevated):** 120-129 / <80 mmHg\n• **உயர் இரத்த அழுத்தம் Stage 1:** 130-139 / 80-89 mmHg\n• **உயர் இரத்த அழுத்தம் Stage 2:** 140/90 mmHg-க்கு மேல்\n\n**BP-ஐ உடனடியாக கட்டுக்குள் வைக்க:**\n1. **அமைதியாக ஓய்வெடுங்கள்:** நாற்காலியில் 5 நிமிடங்கள் கால்களை தரையில் வைத்து அமைதியாக அமருங்கள்.\n2. **உப்பு குறைப்பு:** உணவில் சோடியம் (Sodium) அளவை தினசரி 2g-க்கு கீழ் குறைக்கவும்.\n3. **பொட்டாசியம் உணவுகள்:** வாழைப்பழம், இளநீர், கீரைகள் இரத்த அழுத்தத்தை குறைக்க உதவும்.\n4. **நடைபயிற்சி:** தினமும் 30 நிமிடங்கள் மிதமான நடைபயிற்சி செய்யவும்.\n\n⚠️ *எச்சரிக்கை: BP 180/120-க்கு மேல் இருந்து நெஞ்சுவலி அல்லது மூச்சுத்திணறல் இருந்தால் உடனடியாக மருத்துவமனை செல்லவும்.*`;
    }
    if (language === 'Hindi') {
      return `### 💓 रक्तचाप (Blood Pressure) सम्पूर्ण क्लिनिकल गाइड\n\n**रक्तचाप की श्रेणियां:**\n• **सामान्य (Normal):** 120/80 mmHg से कम\n• **प्रारंभिक बढ़ा हुआ (Elevated):** 120-129 / <80 mmHg\n• **हाई बीपी स्टेज 1:** 130-139 / 80-89 mmHg\n• **हाई बीपी स्टेज 2:** 140/90 mmHg या अधिक\n\n**बीपी नियंत्रित करने के प्रमुख उपाय:**\n1. **विश्राम करें:** 5 मिनट शांत बैठकर गहरी सांस लें।\n2. **नमक कम करें:** दैनिक आहार में सोडियम की मात्रा कम रखें।\n3. **पोटैशियम युक्त आहार:** केला, नारियल पानी और पालक का सेवन करें।\n4. **दैनिक व्यायाम:** 30 मिनट का तेज चलना रक्तचाप को स्थिर रखता है।\n\n⚠️ *चेतावनी: यदि बीपी 180/120 से ऊपर हो और सिरदर्द या सीने में दर्द हो, तो तुरंत आपातकालीन चिकित्सा लें।*`;
    }
    return `### 💓 Comprehensive Blood Pressure (BP) Clinical Guide\n\n**Standard AHA Clinical Categories:**\n• **Optimal / Normal:** Less than **120/80 mmHg**\n• **Elevated:** Systolic **120–129** and Diastolic **<80**\n• **Stage 1 Hypertension:** Systolic **130–139** OR Diastolic **80–89**\n• **Stage 2 Hypertension:** Systolic **≥140** OR Diastolic **≥90**\n• **Hypertensive Crisis:** Systolic **>180** and/or Diastolic **>120** *(Requires immediate ER care)*\n\n**Evidence-Based Action Plan:**\n1. **DASH Diet Principles:** Maximize potassium, magnesium, and calcium while restricting daily sodium (<2,000 mg).\n2. **Aerobic Conditioning:** 150 minutes of weekly moderate aerobic exercise lowers systolic BP by 5–8 mmHg.\n3. **Stress Reduction:** Regular diaphragmatic breathing stimulates parasympathetic vagal tone.\n4. **Optical Monitoring:** Use the TitanVitals BP Monitor daily at the same time for baseline accuracy.`;
  }

  // Heart Rate & Pulse
  if (matches(['heart rate', 'pulse', 'bpm', 'palpitations', 'tachycardia', 'bradycardia', 'இதய துடிப்பு', 'நாடித்துடிப்பு', 'हार्ट रेट', 'धड़कन', 'पल्स'])) {
    if (language === 'Tamil') {
      return `### 🫀 இதய துடிப்பு (Heart Rate / Pulse) வழிகாட்டி\n\n**இயல்பான அளவுகள்:**\n• **பெரியவர்களுக்கு (Resting):** நிமிடத்திற்கு **60 முதல் 100 BPM**.\n• **விளையாட்டு வீரர்கள்:** 40 முதல் 60 BPM (ஆரோக்கியமான இதய தசை).\n\n**அசாதாரண நிலைகள்:**\n• **Tachycardia (அதிவேக துடிப்பு):** ஓய்வில் 100 BPM-க்கு மேல்.\n• **Bradycardia (குறைந்த துடிப்பு):** ஓய்வில் 60 BPM-க்கு கீழ் (தலைச்சுற்றல் இருந்தால் மருத்துவரை பார்க்கவும்).\n\n**இதயத்தை சீராக வைக்க:** காபி/டீ அளவை குறைக்கவும், போதுமான தண்ணீர் குடிக்கவும், ஆழ்ந்த மூச்சு பயிற்சி செய்யவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🫀 हृदय गति (Heart Rate) और पल्स गाइड\n\n**सामान्य स्तर:**\n• **वयस्कों के लिए विश्राम के समय:** **60 से 100 BPM** (धड़कन प्रति मिनट)।\n• **एथलीटों के लिए:** 40 से 60 BPM (मजबूत हृदय का संकेत)।\n\n**अनियमितताएं:**\n• **टैचीकार्डिया:** विश्राम में 100 BPM से अधिक तेज धड़कन।\n• **ब्रैडीकार्डिया:** 60 BPM से कम धड़कन (यदि चक्कर आए तो डॉक्टर से संपर्क करें)।\n\n**हृदय को स्वस्थ रखने के उपाय:** पर्याप्त पानी पिएं, कैफीन कम करें और प्रतिदिन 20 मिनट ध्यान/प्राणायाम करें।`;
    }
    return `### 🫀 Heart Rate & Pulse Rate Clinical Reference\n\n**Standard Resting Heart Rate (RHR) Ranges:**\n• **Normal Adult:** **60 – 100 BPM**\n• **Well-Conditioned Athletes:** **40 – 60 BPM** *(Efficient stroke volume)*\n• **Tachycardia:** > 100 BPM at rest *(May be triggered by stress, fever, dehydration, or caffeine)*\n• **Bradycardia:** < 60 BPM at rest *(Pathological if accompanied by dizziness or syncope)*\n\n**Optimization Protocol:**\n1. Ensure adequate hydration (dehydration forces higher resting BPM).\n2. Monitor your Heart Rate Variability (HRV) for autonomic recovery.\n3. Practice 5 minutes of resonant breathing to downregulate sympathetic drive.`;
  }

  // Oxygen & SpO2
  if (matches(['spo2', 'oxygen', 'o2', 'pulse oximeter', 'ஆக்சிஜன்', 'ஆக்ஸிஜன்', 'ऑक्सीजन', 'एसपीओ2'])) {
    if (language === 'Tamil') {
      return `### 🫁 இரத்த ஆக்சிஜன் அளவு (SpO2) வழிகாட்டி\n\n• **சாதாரண அளவு:** **95% முதல் 100%** வரை.\n• **கவனிக்க வேண்டிய நிலை:** **90% - 94%** (மருத்துவ ஆலோசனையை பெறவும்).\n• **ஆபத்தான நிலை (Hypoxia):** **90%-க்கு கீழ்** (உடனடி ஆக்சிஜன் சிகிச்சை தேவை).\n\n**ஆக்சிஜன் அளவை மேம்படுத்த:**\n1. நிமிர்ந்து அமர்ந்து ஆழமாக மூச்சை உள்ளிழுத்து மெதுவாக விடவும் (Prone breathing).\n2. அறையில் நல்ல காற்றோட்டம் இருப்பதை உறுதி செய்யவும்.\n3. நீராவி பிடிக்கவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🫁 रक्त में ऑक्सीजन स्तर (SpO2) गाइड\n\n• **सामान्य स्तर:** **95% से 100%**।\n• **मध्यम स्तर:** **90% से 94%** (निगरानी और परामर्श की आवश्यकता)।\n• **गंभीर स्तर (Hypoxia):** **90% से कम** (तत्काल आपातकालीन ऑक्सीजन सहायता आवश्यक)।\n\n**सुझाव:** फेफड़ों की क्षमता बढ़ाने के लिए प्राणायाम और वेंटिलेशन युक्त खुले वातावरण में विश्राम करें।`;
    }
    return `### 🫁 Blood Oxygen Saturation (SpO2) Parameters\n\n• **Normal Range:** **95% – 100%** on room air.\n• **Mild Hypoxemia:** **91% – 94%** *(Requires resting evaluation & clinical consult)*.\n• **Severe Hypoxia:** **< 90%** *(Critical emergency: seek immediate medical care)*.\n\n**Clinical Support:**\n1. Sit fully upright in a high Fowler's position to maximize alveolar expansion.\n2. Ensure warm finger extremities for accurate optical sensor readings.\n3. Perform pursed-lip diaphragmatic breathing.`;
  }

  // Diabetes & Blood Sugar
  if (matches(['diabetes', 'sugar', 'glucose', 'hba1c', 'insulin', 'சர்க்கரை நோய்', 'நீரிழிவு', 'मधुमेह', 'शुगर', 'ग्लूकोज'])) {
    if (language === 'Tamil') {
      return `### 🩸 சர்க்கரை நோய் & குளுக்கோஸ் (Diabetes & Sugar) வழிகாட்டி\n\n**நிலையான அளவுகள்:**\n• **வெறும் வயிற்றில் (Fasting):** 70 - 99 mg/dL (சாதாரணமானது), 100 - 125 mg/dL (Pre-diabetes), 126+ mg/dL (Diabetes)\n• **சாப்பிட்ட 2 மணி நேரம் கழித்து (Post-Meal):** 140 mg/dL-க்கு கீழ் இருக்க வேண்டும்.\n• **HbA1c (3 மாத சராசரி):** 5.7%-க்கு கீழ் (Normal), 6.5%-க்கு மேல் (Diabetes).\n\n**சர்க்கரையை கட்டுக்குள் வைக்க:**\n• வெள்ளை அரிசி, சர்க்கரை, மைதா குறைத்து சிறுதானியங்கள் மற்றும் காய்கறிகளை சேர்க்கவும்.\n• உணவிற்கு பின் 15 நிமிட நடைபயிற்சி குளுக்கோஸ் உயர்வை தடுக்கும்.`;
    }
    if (language === 'Hindi') {
      return `### 🩸 ब्लड शुगर और डायबिटीज (Diabetes) गाइड\n\n**रक्त शर्करा के मानक स्तर:**\n• **खाली पेट (Fasting):** 70 से 99 mg/dL (सामान्य), 100 से 125 mg/dL (प्री-डायबिटीज)\n• **भोजन के 2 घंटे बाद (Post-Prandial):** 140 mg/dL से कम होना चाहिए।\n• **HbA1c स्तर:** 5.7% से कम (सामान्य), 6.5% या अधिक (डायबिटीज)।\n\n**नियंत्रण सुझाव:** चीनी और प्रोसेस्ड कार्बोहाइड्रेट से बचें, फाइबर युक्त हरी सब्जियां खाएं और भोजन के बाद हल्का टहलें।`;
    }
    return `### 🩸 Blood Glucose & Diabetes Management Guide\n\n**Clinical Target Reference:**\n• **Fasting Plasma Glucose (FPG):** 70 – 99 mg/dL (Normal) | 100 – 125 mg/dL (Pre-diabetes) | ≥126 mg/dL (Diabetes)\n• **Post-Prandial (2h after meal):** < 140 mg/dL (Normal) | ≥200 mg/dL (Diabetes)\n• **HbA1c (Long-term glycemic marker):** < 5.7% (Normal) | 5.7%–6.4% (Pre-diabetes) | ≥ 6.5% (Diabetes)\n\n**Clinical Strategies:**\n1. Adopt low-glycemic load complex carbohydrates with high soluble fiber.\n2. Perform post-meal light walking (15 mins) to stimulate non-insulin GLUT-4 glucose uptake.\n3. Log morning and pre-bedtime readings consistently.`;
  }

  // ==========================================
  // 3. COMMON SYMPTOMS & CONDITIONS
  // ==========================================

  // Headache & Migraine
  if (matches(['headache', 'migraine', 'head pain', 'temple pain', 'தலைவலி', 'ஒற்றைத் தலைவலி', 'सिरदर्द', 'माइग्रेन'])) {
    if (language === 'Tamil') {
      return `### 💆 தலைவலி & ஒற்றைத் தலைவலி (Headache) நிவாரணம்\n\n**முக்கிய காரணங்கள்:** நீரிழப்பு (Dehydration), கண் சோர்வு, மன அழுத்தம், அல்லது தூக்கமின்மை.\n\n**உடனடி நிவாரண வழிகள்:**\n1. **நீரேற்றம்:** உடனே 1-2 டம்ளர் தண்ணீர் குடியுங்கள்.\n2. **திரை ஓய்வு:** மொபைல்/கணினி திரையை நிறுத்தி கண்களை மூடி ஓய்வெடுக்கவும்.\n3. **குளிர்ந்த ஒத்தடம்:** நெற்றி மற்றும் பிடறியில் குளிர்ந்த துணியை வைக்கவும்.\n4. **சுவாச பயிற்சி:** 5 நிமிடங்கள் மெதுவாக மூச்சை உள்ளிழுத்து விடவும்.\n\n⚠️ *எச்சரிக்கை: தலைவலியுடன் பார்வை மங்குதல், கழுத்து விரைப்பு அல்லது வாந்தி இருந்தால் மருத்துவரை அணுகவும்.*`;
    }
    if (language === 'Hindi') {
      return `### 💆 सिरदर्द और माइग्रेन (Headache) से राहत के उपाय\n\n**सामान्य कारण:** पानी की कमी, स्क्रीन का अधिक उपयोग, तनाव या नींद की कमी।\n\n**तत्काल राहत के उपाय:**\n1. **पानी पिएं:** 1-2 गिलास ताजा पानी पिएं (डिहाइड्रेशन सिरदर्द का मुख्य कारण है)।\n2. **विश्राम:** मंद रोशनी वाले शांत कमरे में 15 मिनट विश्राम करें।\n3. **ठंडा सेक:** माथे और गर्दन के पीछे हल्का ठंडा सेक लगाएं।\n4. **कैफीन नियंत्रण:** अत्यधिक चाय या कॉफी से बचें।\n\n⚠️ *चेतावनी: यदि सिरदर्द अचानक बहुत तेज हो या गर्दन में अकड़न हो, तो तुरंत डॉक्टर को दिखाएं।*`;
    }
    return `### 💆 Clinical Protocol for Headache & Migraine Relief\n\n**Common Pathologies:** Tension headache (cervical tension), Dehydration trigger, Migraine with/without aura, Sinus congestion.\n\n**Immediate Clinical Self-Care:**\n1. **Rapid Rehydration:** Drink 400–500ml of electrolyte water immediately.\n2. **Sensory Deprivation:** Rest in a cool, dark room to reduce photophobia and phonophobia.\n3. **Cryotherapy:** Apply a cold compress across the forehead and temples for vasoconstrictive relief.\n4. **Acupressure:** Gently massage the LI-4 pressure point (webbing between thumb and index finger) for 2 minutes.\n\n*Red Flags: Seek emergency triage if headache onset is instantaneous ('thunderclap'), accompanied by neck rigidity, confusion, or focal numbness.*`;
  }

  // Fever & Infection
  if (matches(['fever', 'temperature', 'chills', 'pyrexia', 'காய்ச்சல்', 'சூடு', 'बुखार', 'तापमान', 'ठंड लगना'])) {
    if (language === 'Tamil') {
      return `### 🌡️ காய்ச்சல் (Fever) பராமரிப்பு வழிகாட்டி\n\n• **லேசான காய்ச்சல்:** 99°F – 100.4°F\n• **மிதமான காய்ச்சல்:** 100.5°F – 102°F\n• **அதிக காய்ச்சல்:** 102°F-க்கு மேல்\n\n**பராமரிப்பு முறைகள்:**\n1. **திரவ ஆகாரங்கள்:** இளநீர், ORS, சூடான சூப், கஞ்சி நிறைய குடிக்கவும்.\n2. **உடல் ஓய்வு:** உடலுக்கு முழு ஓய்வு தரவும்.\n3. **நனைத்த துணி ஒத்தடம்:** சாதாரண நீரில் நனைத்த துணியால் நெற்றியை துடைக்கவும் (ஐஸ் நீர் வேண்டாம்).\n4. **மருந்து:** தேவைப்பட்டால் பாராசிட்டமால் (Paracetamol 500mg) எடுத்துக்கொள்ளலாம்.\n\n⚠️ *3 நாட்களுக்கு மேல் காய்ச்சல் நீடித்தாலோ அல்லது 102°F-க்கு மேல் சென்றாலோ ரத்த பரிசோதனை செய்து மருத்துவரை அணுகவும்.*`;
    }
    if (language === 'Hindi') {
      return `### 🌡️ बुखार (Fever) प्रबंधन और प्राथमिक उपचार\n\n• **हल्का बुखार:** 99°F से 100.4°F\n• **मध्यम बुखार:** 100.5°F से 102°F\n• **तेज बुखार:** 102°F से अधिक\n\n**घरेलू देखभाल:**\n1. **भरपूर तरल पदार्थ:** ओआरएस, नारियल पानी और गर्म सूप पिएं।\n2. **शरीर को विश्राम दें:** शारीरिक श्रम से बचें।\n3. **सामान्य पानी की पट्टी:** माथे पर सामान्य पानी की ठंडी पट्टी रखें।\n4. **दवा:** जरूरत पड़ने पर पैरासिटामोल (500mg) ले सकते हैं।\n\n⚠️ *यदि बुखार 3 दिन से अधिक रहे या 102°F से ऊपर हो तो डॉक्टर से परामर्श लें।*`;
    }
    return `### 🌡️ Clinical Fever Management Protocol\n\n**Thermal Staging:**\n• **Low-Grade:** 37.5°C – 38.0°C (99.5°F – 100.4°F)\n• **Moderate:** 38.1°C – 39.0°C (100.5°F – 102.2°F)\n• **High-Grade:** > 39.0°C (> 102.2°F)\n\n**Clinical Action Guidelines:**\n1. **Continuous Hydration:** 250ml fluid per hour to prevent hypovolemia and metabolic acidosis.\n2. **Tepid Sponging:** Use lukewarm water on forehead and axillae (avoid cold water which causes shivering vasoconstriction).\n3. **Antipyretics:** Paracetamol 500–650mg every 6 hours as needed (stay within 3,000mg/24h ceiling).\n4. **Diagnostic Workup:** Order CBC, Dengue NS1/IgM, and Malaria smear if fever persists > 72 hours.`;
  }

  // Cough, Cold & Sore Throat
  if (matches(['cough', 'cold', 'sore throat', 'runny nose', 'phlegm', 'congestion', 'flu', 'இருமல்', 'சளி', 'தொண்டை வலி', 'खांसी', 'जुकाम', 'सर्दी', 'गले में खराश'])) {
    if (language === 'Tamil') {
      return `### 🤧 சளி, இருமல் & தொண்டை வலி நிவாரணம்\n\n**எளிய வீட்டு சிகிச்சை முறைகள்:**\n1. **உப்பு நீர் கொப்பளிப்பு:** வெதுவெதுப்பான நீரில் கல் உப்பு போட்டு தினமும் 3 முறை தொண்டையில் கொப்பளிக்கவும்.\n2. **நீராவி பிடித்தல் (Steam Inhalation):** மூக்கடைப்பு மற்றும் சளியை இளக்க துளசி அல்லது யூகலிப்டஸ் தைலத்துடன் ஆவி பிடிக்கவும்.\n3. **மிளகு-மஞ்சள் பால்:** இரவில் வெதுவெதுப்பான பாலில் சிறிது மஞ்சள் தூள் மற்றும் மிளகுத்தூள் கலந்து குடிக்கவும்.\n4. **வெதுவெதுப்பான நீர்:** தொடர்ந்து சுடுநீர் மட்டுமே அருந்தவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🤧 सर्दी, खांसी और गले की खराश के उपाय\n\n**प्रभावी घरेलू उपचार:**\n1. **नमक के पानी से गरारे:** हल्के गर्म पानी में सेंधा नमक मिलाकर दिन में 3 बार गरारे करें।\n2. **भाप लें (Steam):** दिन में 2 बार गर्म पानी की भाप लें, इससे बंद नाक और जकड़न खुलती है।\n3. **हल्दी वाला दूध:** रात को गर्म दूध में चुटकी भर हल्दी और काली मिर्च मिलाकर पिएं।\n4. **शहद और अदरक:** 1 चम्मच अदरक के रस में थोड़ा शहद मिलाकर सेवन करें।`;
    }
    return `### 🤧 Respiratory & Cold/Cough Recovery Protocol\n\n**Differential:** Viral Upper Respiratory Tract Infection (URTI), Acute Bronchitis, Allergic Rhinitis.\n\n**Evidence-Based Protocols:**\n1. **Hypertonic Saline Gargle:** 1/2 tsp salt in 200ml warm water 3x daily clears mucosal pathogens and reduces pharyngeal edema.\n2. **Facial Steam Inhalation:** 10 minutes twice daily liquefies bronchial secretions.\n3. **Natural Demulcent:** Honey (10g) with warm water has proven clinical antitussive efficacy.\n4. **Hydration & Humidity:** Maintain indoor humidity around 45–50% to prevent mucosal drying.`;
  }

  // Acidity, Gas & Stomach Pain
  if (matches(['acidity', 'gas', 'gerd', 'heartburn', 'stomach pain', 'indigestion', 'bloating', 'constipation', 'diarrhea', 'அசிடிட்டி', 'வயிற்று வலி', 'வாயு', 'செரிமானம்', 'மலச்சிக்கல்', 'एसिडिटी', 'पेट दर्द', 'गैस', 'कब्ज', 'दस्त'])) {
    if (language === 'Tamil') {
      return `### 🥣 செரிமானம், அசிடிட்டி & வயிற்று வலி வழிகாட்டி\n\n**அசிடிட்டி குறைய:**\n1. குளிர்ந்த பால் அல்லது இளநீர் குடிக்கவும்.\n2. சாப்பிட்டவுடன் படுக்க வேண்டாம்; குறைந்தது 2 மணி நேரம் இடைவெளி தேவை.\n3. அதிக காரம், எண்ணெய் மற்றும் டீ/காபி தவிர்க்கவும்.\n4. சீரக நீர் அல்லது பெருங்காய நீர் செரிமானத்திற்கு மிகவும் சிறந்தது.\n\n**மலச்சிக்கல் இருந்தால்:** அதிக நார்ச்சத்து உள்ள கீரைகள், பப்பாளி மற்றும் 3 லிட்டர் தண்ணீர் குடிக்கவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🥣 एसिडिटी, पेट दर्द और पाचन स्वास्थ्य गाइड\n\n**एसिडिटी और गैस से राहत:**\n1. ठंडा दूध या नारियल पानी पिएं।\n2. भोजन के तुरंत बाद न सोएं; भोजन और सोने के बीच 2 घंटे का अंतर रखें।\n3. अत्यधिक मिर्च-मसाले, तला-भुना और चाय-कॉफी से परहेज करें।\n4. जीरा पानी या सौंफ का पानी पाचन को सुधारने में बेहद असरदार है।\n\n**कब्ज से राहत:** फाइबर युक्त आहार, पपीता और पर्याप्त पानी का सेवन करें।`;
    }
    return `### 🥣 Gastrointestinal, Acid Reflux & Gut Health Protocol\n\n**Common Causes:** Gastroesophageal Reflux (GERD), Functional Dyspepsia, Dysbiosis, Dehydration.\n\n**Clinical Management:**\n1. **Acid Reflux Relief:** Elevate head of bed by 15 cm; avoid trigger foods (acidic citrus, caffeine, high-fat fried items).\n2. **Post-Prandial Routine:** Do not recline for at least 120 minutes post meal.\n3. **Hydration Balance:** Drink water between meals rather than large volumes during meals to maintain stomach acid enzymes.\n4. **Probiotics & Fiber:** Consume fermented foods (curd/yogurt) and 25–30g soluble dietary fiber daily.`;
  }

  // ==========================================
  // 4. MENTAL HEALTH, STRESS & SLEEP
  // ==========================================

  // Stress & Anxiety
  if (matches(['stress', 'anxiety', 'panic', 'depression', 'nervous', 'calm', 'மன அழுத்தம்', 'பதட்டம்', 'तनाव', 'चिंता', 'घबराहट'])) {
    if (language === 'Tamil') {
      return `### 🧘 மன அழுத்தம் & பதட்டம் குறைக்கும் வழிமுறைகள்\n\n**உடனடி 4-7-8 சுவாச பயிற்சி (Clinical Reset):**\n1. மூக்கு வழியாக **4 நொடிகள்** மெதுவாக மூச்சை உள்ளிழுக்கவும்.\n2. **7 நொடிகள்** மூச்சை அடக்கி வைக்கவும்.\n3. வாய் வழியாக **8 நொடிகள்** மெதுவாக ஊதி மூச்சை வெளிவிடவும்.\n*(இதை 4 முறை செய்யவும் - உங்கள் இதய துடிப்பு மற்றும் பதட்டம் உடனே குறையும்)*\n\n• தினமும் 15 நிமிடம் நடைபயிற்சி மற்றும் தியானம் செய்யவும்.\n• காபி மற்றும் சர்க்கரை உணவுகளை குறைக்கவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🧘 मानसिक तनाव और चिंता (Anxiety) दूर करने के उपाय\n\n**4-7-8 ब्रीदिंग तकनीक (तत्काल शांति के लिए):**\n1. नाक से **4 सेकंड** तक गहरी सांस अंदर लें।\n2. **7 सेकंड** तक सांस को रोककर रखें।\n3. मुंह से **8 सेकंड** तक धीरे-धीरे सांस छोड़ें।\n*(इसे 4 चक्रों में दोहराएं - हृदय गति तुरंत शांत होगी)*\n\n• प्रतिदिन 15-20 मिनट ताजी हवा में टहलें।\n• कैफीन की मात्रा कम करें और 8 घंटे की पूरी नींद लें।`;
    }
    return `### 🧘 Clinical Autonomic Reset for Stress & Anxiety\n\n**Neuro-Somatic Reset: 4-7-8 Vagus Nerve Stimulation**\n1. Inhale silently through the nose for **4 seconds**.\n2. Hold breath gently for **7 seconds**.\n3. Exhale completely with a whoosh sound for **8 seconds**.\n*Execute 4 cycles to shift the nervous system from sympathetic (fight/flight) to parasympathetic (rest/digest).* \n\n**Biochemical Strategies:**\n• **Magnesium & L-Theanine:** Support GABAergic neurotransmission.\n• **Cortisol Management:** Limit caffeine after 12:00 PM and maintain 30 minutes of natural daylight exposure in the morning.`;
  }

  // Sleep & Insomnia
  if (matches(['sleep', 'insomnia', 'cant sleep', 'tired', 'தூக்கம்', 'தூக்கமின்மை', 'नींद', 'अनिद्रा'])) {
    if (language === 'Tamil') {
      return `### 😴 ஆழ்ந்த தூக்கத்திற்கான மருத்துவ வழிகாட்டி\n\n1. **ஒரே நேரம்:** தினமும் ஒரே நேரத்தில் படுக்கைக்கு சென்று ஒரே நேரத்தில் எழுந்திருங்கள்.\n2. **திரை நிறுத்தம்:** படுப்பதற்கு 45 நிமிடங்களுக்கு முன் மொபைல், லேப்டாப் திரையை அணைக்கவும்.\n3. **குளிர்ந்த அறை:** படுக்கையறை அமைதியாகவும், வெளிச்சமின்றியும், குளுமையாகவும் இருப்பதை உறுதி செய்யவும்.\n4. **மாலையில் காபி வேண்டாம்:** மாலை 4 மணிக்கு மேல் காபி, டீ குடிப்பதை தவிர்க்கவும்.`;
    }
    if (language === 'Hindi') {
      return `### 😴 गहरी और आरामदायक नींद के लिए गाइड\n\n1. **नियत समय:** प्रतिदिन एक ही समय पर सोने और जागने का नियम बनाएं।\n2. **स्क्रीन से दूरी:** सोने से 45 मिनट पहले मोबाइल और टीवी का उपयोग बंद करें।\n3. **शांत वातावरण:** बेडरूम को शांत, अंधेरा और ठंडा रखें।\n4. **कैफीन से परहेज:** शाम के समय चाय-कॉफी का सेवन न करें।`;
    }
    return `### 😴 Clinical Sleep Hygiene & Circadian Optimization\n\n1. **Circadian Entrainment:** Get 15 minutes of direct morning sunlight to anchor the suprachiasmatic nucleus.\n2. **Blue Light Block:** Restrict screens 60 minutes before bed to allow natural pineal melatonin secretion.\n3. **Thermal Optimization:** Maintain ambient room temperature at 18–20°C (65–68°F).\n4. **Caffeine Half-Life:** Avoid caffeine within 8 hours of bedtime (half-life is ~5.7 hours).`;
  }

  // ==========================================
  // 5. NUTRITION, DIET & FITNESS
  // ==========================================

  // Diet & Weight Loss
  if (matches(['diet', 'food', 'nutrition', 'weight loss', 'calorie', 'protein', 'உணவு', 'எடை குறைய', 'டயட்', 'आहार', 'डाइट', 'वजन'])) {
    if (language === 'Tamil') {
      return `### 🥗 இதய நலன் & சமச்சீர் உணவு வழிகாட்டி\n\n• **சேர்க்க வேண்டியவை:** கீரைகள், சுரைக்காய், வெண்டைக்காய், முளைகட்டிய பயிர்கள், பாதாம், அக்ரூட், ஆப்பிள், கொய்யா.\n• **புரதச்சத்து (Protein):** பருப்பு வகைகள், சுண்டல், பனீர், முட்டை, மீன்.\n• **தவிர்க்க வேண்டியவை:** ரீஃபைண்ட் ஆயில், துரித உணவுகள், அதிக உப்பு மற்றும் சர்க்கரை.\n• **தண்ணீர்:** தினமும் 2.5 முதல் 3 லிட்டர் தண்ணீர் குடிப்பது உடலின் மெட்டபாலிசத்தை அதிகரிக்கும்.`;
    }
    if (language === 'Hindi') {
      return `### 🥗 संतुलित आहार और स्वस्थ पोषण गाइड\n\n• **थाली का सही संतुलन:** 50% हरी सब्जियां व सलाद, 25% प्रोटीन (दालें/अंडे/पनीर), 25% साबुत अनाज (ब्राउन राइस/रोटी)।\n• **स्वस्थ वसा:** बादाम, अखरोट, चिया बीज और जैतून का तेल।\n• **बचाव:** सफेद चीनी, मैदा और पैकेज्ड स्नैक्स कम करें।\n• **हाइड्रेशन:** प्रतिदिन कम से कम 2.5 से 3 लीटर पानी अवश्य पिएं।`;
    }
    return `### 🥗 Evidence-Based Cardio-Metabolic Nutrition Guide\n\n**Macronutrient Framework:**\n• **50% Micronutrients & Fiber:** Non-starchy cruciferous vegetables, leafy greens, berries.\n• **25% Quality Protein:** Legumes, tofu, pasture-raised eggs, wild salmon (aim for 1.2–1.6g/kg body weight).\n• **25% Complex Carbohydrates:** Quinoa, steel-cut oats, millets, sweet potatoes.\n\n**Cardiovascular Guardrails:** Keep saturated fat <7% of total calories and eliminate industrial trans-fats.`;
  }

  // Water & Hydration
  if (matches(['water', 'hydration', 'fluid', 'தண்ணீர்', 'நீரேற்றம்', 'पानी', 'हाइड्रेशन'])) {
    if (language === 'Tamil') {
      return `### 💧 தினசரி தண்ணீர் தேவை (Hydration Guide)\n\n• **பரிந்துரைக்கப்படும் அளவு:** ஒரு நாளைக்கு **2.5 முதல் 3.5 லிட்டர்** (சுமார் 8-10 டம்ளர்கள்).\n• **சரியான முறை:** காலையில் எழுந்தவுடன் 2 டம்ளர் வெதுவெதுப்பான நீர் குடிக்கவும்.\n• **நீரிழப்பின் அறிகுறிகள்:** அடர் மஞ்சள் நிற சிறுநீர், தலைவலி, வாய் வறட்சி, சோர்வு.`;
    }
    if (language === 'Hindi') {
      return `### 💧 दैनिक जल सेवन और हाइड्रेशन गाइड\n\n• **दैनिक आवश्यकता:** प्रतिदिन **2.5 से 3.5 लीटर** (8 से 10 गिलास) पानी पिएं।\n• **सर्वोत्तम नियम:** सुबह उठते ही 2 गिलास गुनगुना पानी पिएं।\n• **डिहाइड्रेशन के संकेत:** गहरा पीला पेशाब, सिरदर्द, शुष्क मुँह और थकान।`;
    }
    return `### 💧 Optimal Hydration & Electrolyte Science\n\n• **Baseline Intake:** 30–35 ml per kg of body weight (~2.5–3.5L daily for adults).\n• **Performance Impact:** Even 2% dehydration impairs cognitive executive function and increases heart rate.\n• **Bio-Marker Check:** Urine color should resemble pale straw (clear/light yellow).`;
  }

  // ==========================================
  // 6. FIRST AID & EMERGENCY
  // ==========================================

  if (matches(['emergency', 'first aid', 'chest pain', 'fainting', 'stroke', 'bleeding', 'burns', 'அவசர', 'நெஞ்சு வலி', 'மயக்கம்', 'முதலுதவி', 'सीने में दर्द', 'आपातकालीन', 'बेहोशी', 'प्राथमिक उपचार'])) {
    if (language === 'Tamil') {
      return `### 🚨 அவசர முதலுதவி வழிகாட்டி (Emergency Protocols)\n\n• **நெஞ்சு வலி / மூச்சுத்திணறல் (Chest Pain):** உடனடியாக மருத்துவ அவசர எண் (108 / 112) அழையுங்கள். நோயாளியை அமர வைக்கவும்.\n• **மயக்கம் (Fainting):** நோயாளியை படுக்க வைத்து கால்களை சிறிது உயரமாக தூக்கி வைக்கவும். ஆடைகளை தளர்த்தவும்.\n• **தீக்காயம் (Burns):** காயம்பட்ட இடத்தில் 15 நிமிடங்கள் சாதாரண குளிர்ந்த நீர் ஊற்றவும் (ஐஸ் அல்லது பற்பசை வைக்க வேண்டாம்).\n• **காயங்களில் ரத்தப்போக்கு:** சுத்தமான துணியை வைத்து அழுத்தமாக 5-10 நிமிடங்கள் அழுத்தி பிடிக்கவும்.`;
    }
    if (language === 'Hindi') {
      return `### 🚨 आपातकालीन प्राथमिक चिकित्सा (First Aid)\n\n• **सीने में तेज दर्द / सांस फूलना:** तुरंत आपातकालीन नंबर (108 / 112) पर कॉल करें। मरीज को आराम से बैठाएं।\n• **बेहोशी (Fainting):** व्यक्ति को सीधा लिटाएं और पैरों को थोड़ा ऊपर उठाएं ताकि मस्तिष्क में रक्त प्रवाह बढ़े।\n• **जलने पर (Burns):** जले हुए स्थान पर 10-15 मिनट सामान्य बहता पानी डालें। बर्फ या टूथपेस्ट न लगाएं।\n• **रक्तस्राव (Bleeding):** घाव पर साफ कपड़ा रखकर 5 मिनट तक सीधा दबाव बनाएं।`;
    }
    return `### 🚨 Critical Clinical Triage & First Aid Protocols\n\n• **Acute Chest Pain / Angina:** Call emergency services (911/112/108) immediately. Keep patient seated comfortably in a semi-recumbent posture.\n• **Syncope / Fainting:** Lay patient supine and elevate lower extremities 30 cm to facilitate venous return to the brain.\n• **Thermal Burns:** Cool under running potable water for 15–20 minutes. Do not apply ice, oils, or toothpaste.\n• **Hemorrhage:** Apply firm, continuous direct pressure with sterile gauze for at least 10 minutes without releasing.`;
  }

  // ==========================================
  // 7. TITANVITALS TELEMETRY & APP GUIDANCE
  // ==========================================

  if (matches(['how to use', 'scan vitals', 'scan bp', 'titanvitals', 'feature', 'எப்படி பயன்படுத்துவது', 'उपयोग कैसे करें'])) {
    if (language === 'Tamil') {
      return `### 📱 டைட்டன்வைட்டல்ஸ் (TitanVitals) பயன்பாட்டு வழிகாட்டி\n\n1. **BP Monitor (இரத்த அழுத்த ஸ்கேன்):** உங்கள் விரலை கேமரா மீது வைத்து 30 நொடிகள் அசையாமல் அளவிடவும்.\n2. **AI Analyzer:** உங்கள் மருத்துவ அறிக்கைகள் அல்லது மருந்து சீட்டுகளை பதிவேற்றி உடனடி பகுப்பாய்வு பெறலாம்.\n3. **Records & Dashboard:** உங்கள் இதய துடிப்பு மற்றும் BP வரலாற்றை வரைபடங்களாக கண்காணிக்கலாம்.\n4. **Settings:** சுயவிவரம் மற்றும் அனிமேஷன் அவதாரங்களை மாற்ற Settings செல்லவும்.`;
    }
    if (language === 'Hindi') {
      return `### 📱 टाइटनवाइटल्स (TitanVitals) का उपयोग कैसे करें\n\n1. **बीपी मॉनिटर (BP Scan):** कैमरे पर अपनी उंगली रखें और 30 सेकंड तक स्थिर रहकर रक्तचाप मापें।\n2. **AI एनालाइज़र:** अपनी मेडिकल रिपोर्ट या डॉक्टर के पर्चे की फोटो अपलोड करके विश्लेषण पाएं।\n3. **डैशबोर्ड और रिकॉर्ड्स:** अपने वाइटल्स का दैनिक रिकॉर्ड और ट्रेंड चार्ट्स देखें।\n4. **सेटिंग्स:** अपनी प्रोफाइल फोटो और एनिमेटेड अवतार बदलने के लिए Settings में जाएं।`;
    }
    return `### 📱 TitanVitals Telemetry & Platform Navigation\n\n1. **Optical BP & Vital Scanner:** Place index finger steadily over camera sensor for photoplethysmography (PPG) waveform acquisition.\n2. **AI Health Document Analyzer:** Upload PDF/JPEG clinical lab reports or prescriptions for instant biomarker summarization.\n3. **Telemetry Dashboard:** Live longitudinal visualization of systolic/diastolic trends, heart rate variability, and SpO2.\n4. **Profile Studio:** Access Settings → Profile to select from 6 Animated Character Avatars or upload a custom photo.`;
  }

  // ==========================================
  // 8. DYNAMIC HEALTH CONVERSATION DEFAULT
  // ==========================================
  if (language === 'Tamil') {
    return `உங்கள் கேள்விக்கு நன்றி! "${userMessage}" தொடர்பாக:\n\n• **உடல்நல கண்காணிப்பு:** தினசரி இரத்த அழுத்தம், இதய துடிப்பு மற்றும் நீரேற்றத்தை (2.5L) பராமரிப்பது உங்கள் உடலை புத்துணர்ச்சியுடன் வைக்கும்.\n• **பரிந்துரை:** சமச்சீரான உணவு, போதுமான ஓய்வு, மற்றும் லேசான உடற்பயிற்சி நல்வாழ்வுக்கு அவசியம்.\n• குறிப்பிட்ட அறிகுறிகள் (காய்ச்சல், வலி, BP) இருந்தால் விரிவாக கேட்கலாம்!`;
  }

  if (language === 'Hindi') {
    return `आपके सवाल के लिए धन्यवाद! "${userMessage}" के संदर्भ में:\n\n• **स्वास्थ्य निगरानी:** दैनिक रक्तचाप, हृदय गति और पर्याप्त जल सेवन (2.5L) आपके समग्र स्वास्थ्य के लिए महत्वपूर्ण है।\n• **सुझाव:** संतुलित आहार, 7-8 घंटे की नींद और नियमित वॉक आपके शरीर को ऊर्जावान बनाए रखेगा।\n• किसी भी विशिष्ट लक्षण (बुखार, सिरदर्द, बीपी) के बारे में आप विस्तार से पूछ सकते हैं!`;
  }

  return `Thank you for asking about "${userMessage}".\n\n**Clinical Best Practices:**\n• **Vital Tracking:** Regularly monitoring your BP, Resting Heart Rate, and SpO2 via TitanVitals helps establish your healthy personal baseline.\n• **Lifestyle Foundations:** 2.5L daily hydration, a nutrient-dense whole-food diet, and 7–8 hours of restorative sleep accelerate physical recovery.\n• If you are experiencing any acute symptoms or discomfort, please feel free to describe them in detail!`;
};
