// 6 High-Definition Animated Character Avatars (3 Boys & 3 Girls) for TitanVitals
export const ANIMATED_AVATARS = [
  // 3 Boy Characters
  {
    id: 'boy_leo',
    name: 'Leo',
    gender: 'boy',
    genderLabel: 'Boy 👦',
    tagline: 'Tech & Vitals Specialist',
    glowColor: '#00d4ff',
    bgGradient: 'linear-gradient(135deg, #00d4ff 0%, #0077b6 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=0077b6,00d4ff&hair=short01&hairColor=2c1b18&skinColor=f2d3b1',
    animationType: 'anim-float-cyan'
  },
  {
    id: 'boy_ethan',
    name: 'Ethan',
    gender: 'boy',
    genderLabel: 'Boy 👦',
    tagline: 'Cardio & Fitness Dynamo',
    glowColor: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ethan&backgroundColor=d97706,f59e0b&hair=short05&hairColor=4a3728&skinColor=d08b5b',
    animationType: 'anim-pulse-amber'
  },
  {
    id: 'boy_noah',
    name: 'Noah',
    gender: 'boy',
    genderLabel: 'Boy 👦',
    tagline: 'Zen & Mental Well-being',
    glowColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah&backgroundColor=059669,10b981&hair=short02&hairColor=1a1a1a&skinColor=ecc0a0&glasses=variant02',
    animationType: 'anim-wave-emerald'
  },

  // 3 Girl Characters
  {
    id: 'girl_maya',
    name: 'Maya',
    gender: 'girl',
    genderLabel: 'Girl 👧',
    tagline: 'Clinical AI & Diagnostics',
    glowColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=7c3aed,a855f7&hair=long01&hairColor=4c1d95&skinColor=f2d3b1&glasses=variant05',
    animationType: 'anim-float-purple'
  },
  {
    id: 'girl_zara',
    name: 'Zara',
    gender: 'girl',
    genderLabel: 'Girl 👧',
    tagline: 'Immunity & Nutrition Ace',
    glowColor: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zara&backgroundColor=db2777,ec4899&hair=long05&hairColor=1e1b4b&skinColor=ae5d29',
    animationType: 'anim-pulse-pink'
  },
  {
    id: 'girl_aria',
    name: 'Aria',
    gender: 'girl',
    genderLabel: 'Girl 👧',
    tagline: 'Sleep & Recovery Expert',
    glowColor: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=3b82f6,06b6d4&hair=long03&hairColor=e0a96d&skinColor=f2d3b1',
    animationType: 'anim-wave-cyan'
  }
];

export const DEFAULT_AVATAR = ANIMATED_AVATARS[0].url;
