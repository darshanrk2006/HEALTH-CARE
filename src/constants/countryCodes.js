/**
 * GLOBAL COUNTRY CALLING CODES
 * Shared across Auth, Settings Profile, and Emergency Services.
 */

export const GLOBAL_COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', display: '🇮🇳 +91' },
  { code: '+1', country: 'United States', flag: '🇺🇸', display: '🇺🇸 +1' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', display: '🇬🇧 +44' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', display: '🇦🇪 +971' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', display: '🇸🇦 +966' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', display: '🇸🇬 +65' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', display: '🇦🇺 +61' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', display: '🇨🇦 +1' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', display: '🇩🇪 +49' },
  { code: '+33', country: 'France', flag: '🇫🇷', display: '🇫🇷 +33' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', display: '🇯🇵 +81' },
  { code: '+86', country: 'China', flag: '🇨🇳', display: '🇨🇳 +86' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', display: '🇰🇷 +82' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', display: '🇷🇺 +7' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', display: '🇧🇷 +55' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', display: '🇿🇦 +27' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', display: '🇮🇹 +39' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', display: '🇪🇸 +34' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', display: '🇳🇱 +31' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', display: '🇨🇭 +41' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', display: '🇸🇪 +46' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', display: '🇳🇴 +47' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', display: '🇩🇰 +45' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', display: '🇫🇮 +358' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', display: '🇮🇪 +353' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', display: '🇳🇿 +64' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', display: '🇲🇾 +60' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', display: '🇮🇩 +62' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', display: '🇵🇭 +63' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', display: '🇹🇭 +66' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', display: '🇻🇳 +84' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', display: '🇧🇩 +880' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', display: '🇱🇰 +94' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', display: '🇳🇵 +977' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', display: '🇵🇰 +92' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', display: '🇶🇦 +974' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', display: '🇰🇼 +965' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', display: '🇴🇲 +968' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', display: '🇧🇭 +973' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', display: '🇪🇬 +20' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', display: '🇳🇬 +234' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', display: '🇰🇪 +254' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', display: '🇬🇭 +233' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', display: '🇲🇽 +52' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', display: '🇦🇷 +54' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', display: '🇨🇱 +56' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', display: '🇨🇴 +57' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', display: '🇵🇪 +51' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', display: '🇹🇷 +90' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', display: '🇬🇷 +30' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', display: '🇵🇱 +48' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', display: '🇵🇹 +351' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', display: '🇦🇹 +43' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', display: '🇧🇪 +32' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', display: '🇨🇿 +420' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', display: '🇭🇺 +36' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', display: '🇷🇴 +40' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', display: '🇺🇦 +380' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', display: '🇮🇱 +972' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', display: '🇯🇴 +962' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', display: '🇱🇧 +961' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', display: '🇭🇰 +852' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', display: '🇹🇼 +886' }
];

export function splitCountryCodeAndPhone(rawPhone, defaultCode = '+91') {
  if (!rawPhone) return { code: defaultCode, number: '' };
  const trimmed = String(rawPhone).trim();
  for (const item of GLOBAL_COUNTRY_CODES) {
    if (trimmed.startsWith(item.code)) {
      const remaining = trimmed.slice(item.code.length).trim();
      return { code: item.code, number: remaining };
    }
  }
  return { code: defaultCode, number: trimmed.replace(/^\+\d+\s*/, '') };
}
