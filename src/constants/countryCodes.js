/**
 * GLOBAL COUNTRY CALLING CODES
 * Format: ISO (flag) +Code (e.g., IN 🇮🇳 +91)
 * Shared across Auth, Settings Profile, and Emergency Services.
 */

export const GLOBAL_COUNTRY_CODES = [
  { iso: 'IN', code: '+91', country: 'India', flag: '🇮🇳', display: 'IN 🇮🇳 +91' },
  { iso: 'US', code: '+1', country: 'United States', flag: '🇺🇸', display: 'US 🇺🇸 +1' },
  { iso: 'GB', code: '+44', country: 'United Kingdom', flag: '🇬🇧', display: 'GB 🇬🇧 +44' },
  { iso: 'AE', code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', display: 'AE 🇦🇪 +971' },
  { iso: 'SA', code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', display: 'SA 🇸🇦 +966' },
  { iso: 'SG', code: '+65', country: 'Singapore', flag: '🇸🇬', display: 'SG 🇸🇬 +65' },
  { iso: 'AU', code: '+61', country: 'Australia', flag: '🇦🇺', display: 'AU 🇦🇺 +61' },
  { iso: 'CA', code: '+1', country: 'Canada', flag: '🇨🇦', display: 'CA 🇨🇦 +1' },
  { iso: 'DE', code: '+49', country: 'Germany', flag: '🇩🇪', display: 'DE 🇩🇪 +49' },
  { iso: 'FR', code: '+33', country: 'France', flag: '🇫🇷', display: 'FR 🇫🇷 +33' },
  { iso: 'JP', code: '+81', country: 'Japan', flag: '🇯🇵', display: 'JP 🇯🇵 +81' },
  { iso: 'CN', code: '+86', country: 'China', flag: '🇨🇳', display: 'CN 🇨🇳 +86' },
  { iso: 'KR', code: '+82', country: 'South Korea', flag: '🇰🇷', display: 'KR 🇰🇷 +82' },
  { iso: 'RU', code: '+7', country: 'Russia', flag: '🇷🇺', display: 'RU 🇷🇺 +7' },
  { iso: 'BR', code: '+55', country: 'Brazil', flag: '🇧🇷', display: 'BR 🇧🇷 +55' },
  { iso: 'ZA', code: '+27', country: 'South Africa', flag: '🇿🇦', display: 'ZA 🇿🇦 +27' },
  { iso: 'IT', code: '+39', country: 'Italy', flag: '🇮🇹', display: 'IT 🇮🇹 +39' },
  { iso: 'ES', code: '+34', country: 'Spain', flag: '🇪🇸', display: 'ES 🇪🇸 +34' },
  { iso: 'NL', code: '+31', country: 'Netherlands', flag: '🇳🇱', display: 'NL 🇳🇱 +31' },
  { iso: 'CH', code: '+41', country: 'Switzerland', flag: '🇨🇭', display: 'CH 🇨🇭 +41' },
  { iso: 'SE', code: '+46', country: 'Sweden', flag: '🇸🇪', display: 'SE 🇸🇪 +46' },
  { iso: 'NO', code: '+47', country: 'Norway', flag: '🇳🇴', display: 'NO 🇳🇴 +47' },
  { iso: 'DK', code: '+45', country: 'Denmark', flag: '🇩🇰', display: 'DK 🇩🇰 +45' },
  { iso: 'FI', code: '+358', country: 'Finland', flag: '🇫🇮', display: 'FI 🇫🇮 +358' },
  { iso: 'IE', code: '+353', country: 'Ireland', flag: '🇮🇪', display: 'IE 🇮🇪 +353' },
  { iso: 'NZ', code: '+64', country: 'New Zealand', flag: '🇳🇿', display: 'NZ 🇳🇿 +64' },
  { iso: 'MY', code: '+60', country: 'Malaysia', flag: '🇲🇾', display: 'MY 🇲🇾 +60' },
  { iso: 'ID', code: '+62', country: 'Indonesia', flag: '🇮🇩', display: 'ID 🇮🇩 +62' },
  { iso: 'PH', code: '+63', country: 'Philippines', flag: '🇵🇭', display: 'PH 🇵🇭 +63' },
  { iso: 'TH', code: '+66', country: 'Thailand', flag: '🇹🇭', display: 'TH 🇹🇭 +66' },
  { iso: 'VN', code: '+84', country: 'Vietnam', flag: '🇻🇳', display: 'VN 🇻🇳 +84' },
  { iso: 'BD', code: '+880', country: 'Bangladesh', flag: '🇧🇩', display: 'BD 🇧🇩 +880' },
  { iso: 'LK', code: '+94', country: 'Sri Lanka', flag: '🇱🇰', display: 'LK 🇱🇰 +94' },
  { iso: 'NP', code: '+977', country: 'Nepal', flag: '🇳🇵', display: 'NP 🇳🇵 +977' },
  { iso: 'PK', code: '+92', country: 'Pakistan', flag: '🇵🇰', display: 'PK 🇵🇰 +92' },
  { iso: 'QA', code: '+974', country: 'Qatar', flag: '🇶🇦', display: 'QA 🇶🇦 +974' },
  { iso: 'KW', code: '+965', country: 'Kuwait', flag: '🇰🇼', display: 'KW 🇰🇼 +965' },
  { iso: 'OM', code: '+968', country: 'Oman', flag: '🇴🇲', display: 'OM 🇴🇲 +968' },
  { iso: 'BH', code: '+973', country: 'Bahrain', flag: '🇧🇭', display: 'BH 🇧🇭 +973' },
  { iso: 'EG', code: '+20', country: 'Egypt', flag: '🇪🇬', display: 'EG 🇪🇬 +20' },
  { iso: 'NG', code: '+234', country: 'Nigeria', flag: '🇳🇬', display: 'NG 🇳🇬 +234' },
  { iso: 'KE', code: '+254', country: 'Kenya', flag: '🇰🇪', display: 'KE 🇰🇪 +254' },
  { iso: 'GH', code: '+233', country: 'Ghana', flag: '🇬🇭', display: 'GH 🇬🇭 +233' },
  { iso: 'MX', code: '+52', country: 'Mexico', flag: '🇲🇽', display: 'MX 🇲🇽 +52' },
  { iso: 'AR', code: '+54', country: 'Argentina', flag: '🇦🇷', display: 'AR 🇦🇷 +54' },
  { iso: 'CL', code: '+56', country: 'Chile', flag: '🇨🇱', display: 'CL 🇨🇱 +56' },
  { iso: 'CO', code: '+57', country: 'Colombia', flag: '🇨🇴', display: 'CO 🇨🇴 +57' },
  { iso: 'PE', code: '+51', country: 'Peru', flag: '🇵🇪', display: 'PE 🇵🇪 +51' },
  { iso: 'TR', code: '+90', country: 'Turkey', flag: '🇹🇷', display: 'TR 🇹🇷 +90' },
  { iso: 'GR', code: '+30', country: 'Greece', flag: '🇬🇷', display: 'GR 🇬🇷 +30' },
  { iso: 'PL', code: '+48', country: 'Poland', flag: '🇵🇱', display: 'PL 🇵🇱 +48' },
  { iso: 'PT', code: '+351', country: 'Portugal', flag: '🇵🇹', display: 'PT 🇵🇹 +351' },
  { iso: 'AT', code: '+43', country: 'Austria', flag: '🇦🇹', display: 'AT 🇦🇹 +43' },
  { iso: 'BE', code: '+32', country: 'Belgium', flag: '🇧🇪', display: 'BE 🇧🇪 +32' },
  { iso: 'CZ', code: '+420', country: 'Czech Republic', flag: '🇨🇿', display: 'CZ 🇨🇿 +420' },
  { iso: 'HU', code: '+36', country: 'Hungary', flag: '🇭🇺', display: 'HU 🇭🇺 +36' },
  { iso: 'RO', code: '+40', country: 'Romania', flag: '🇷🇴', display: 'RO 🇷🇴 +40' },
  { iso: 'UA', code: '+380', country: 'Ukraine', flag: '🇺🇦', display: 'UA 🇺🇦 +380' },
  { iso: 'IL', code: '+972', country: 'Israel', flag: '🇮🇱', display: 'IL 🇮🇱 +972' },
  { iso: 'JO', code: '+962', country: 'Jordan', flag: '🇯🇴', display: 'JO 🇯🇴 +962' },
  { iso: 'LB', code: '+961', country: 'Lebanon', flag: '🇱🇧', display: 'LB 🇱🇧 +961' },
  { iso: 'HK', code: '+852', country: 'Hong Kong', flag: '🇭🇰', display: 'HK 🇭🇰 +852' },
  { iso: 'TW', code: '+886', country: 'Taiwan', flag: '🇹🇼', display: 'TW 🇹🇼 +886' }
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
