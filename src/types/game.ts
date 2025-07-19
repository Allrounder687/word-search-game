export interface Position {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string;
  start: Position;
  end: Position;
  direction: Direction;
  found: boolean;
  color: string;
  description?: string;
  urduDescription?: string;
  descriptionType?: 'fivePillars' | 'islamicPlaces' | 'kidsMode';
}

export interface Cell {
  letter: string;
  isSelected: boolean;
  isHighlighted: boolean;
  wordIds: string[];
  color?: string;
}

export type Direction = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export type Theme = 'midnight' | 'royal' | 'pink' | 'pure' | 'darkRoyal' | 'darkPink' | 'ocean' | 'sunset' | 'neon' | 'forest' | 'galaxy' | 'desert' | 'cyber' | 'custom';

export type WordCategory = 'general' | 'animals' | 'islamicPlaces' | 'islamicProphets' | 'fivePillars' | 'islamicTerms' | 'islamicMonths' | 'muslimScientists' | 'quranicSurahs' | 'islamicValues' | 'islamicAngels' | 'islamicBooks' | 'islamicEvents' | 'islamicVirtues' | 'custom';

export type TimerMode = 'none' | 'countdown' | 'countup';

export interface GameSettings {
  difficulty: Difficulty;
  theme: Theme;
  gridSize: number;
  hintsCount?: number;
  timerMode?: TimerMode;
  timerDuration?: number; // in seconds, for countdown mode
  wordCategory?: WordCategory;
  showDescriptions?: boolean; // Toggle for showing word descriptions
  kidsMode?: boolean; // Toggle for kids mode with simplified content
  customWords?: string[];
  customFont?: string; // Custom font selection
  selectionMode?: 'drag' | 'click-start-end' | 'keyboard'; // Word selection mode
  customColors?: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  gridBg: string;
  cellBg: string;
  cellHover: string;
  font: string;
}

export interface GameState {
  grid: Cell[][];
  words: WordPlacement[];
  foundWords: Set<string>;
  score: number;
  timeElapsed: number;
  isComplete: boolean;
  currentSelection: Position[];
  settings: GameSettings;
  currentLevel?: number;
}

export const WORD_LISTS = {
  easy: [
    'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'FISH', 'BIRD',
    'BOOK', 'GAME', 'LOVE', 'HOPE', 'PLAY', 'SING', 'DANCE', 'HAPPY',
    'SMILE', 'LIGHT', 'MAGIC', 'DREAM', 'PEACE', 'JOY', 'HEART'
  ],
  medium: [
    'COMPUTER', 'RAINBOW', 'BUTTERFLY', 'MOUNTAIN', 'OCEAN', 'FOREST',
    'ADVENTURE', 'MYSTERY', 'TREASURE', 'JOURNEY', 'FREEDOM', 'WISDOM',
    'COURAGE', 'HARMONY', 'SERENITY', 'CRYSTAL', 'PHOENIX', 'GALAXY',
    'THUNDER', 'DIAMOND', 'MIRACLE', 'FANTASY', 'DESTINY'
  ],
  hard: [
    'EXTRAORDINARY', 'MAGNIFICENT', 'REVOLUTIONARY', 'SOPHISTICATED',
    'INCOMPREHENSIBLE', 'TRANSFORMATION', 'PHILOSOPHICAL', 'ASTRONOMICAL',
    'INTERNATIONAL', 'CONSTITUTIONAL', 'ENTREPRENEURIAL', 'MULTIDIMENSIONAL',
    'INTERDISCIPLINARY', 'TRANSCENDENTAL', 'METAMORPHOSIS', 'KALEIDOSCOPE'
  ]
};

export const CATEGORY_WORD_LISTS = {
  general: {
    easy: WORD_LISTS.easy,
    medium: WORD_LISTS.medium,
    hard: WORD_LISTS.hard
  },
  animals: {
    easy: [
      'CAT', 'DOG', 'FISH', 'BIRD', 'LION', 'TIGER', 'CAMEL', 'SHEEP',
      'GOAT', 'HORSE', 'COW', 'DUCK', 'FROG', 'DEER', 'WOLF', 'FOX'
    ],
    medium: [
      'ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'KANGAROO', 'LEOPARD',
      'GAZELLE', 'BUTTERFLY', 'SCORPION', 'PEACOCK', 'FALCON', 'TURTLE',
      'RABBIT', 'SQUIRREL', 'MONKEY', 'ZEBRA', 'OSTRICH', 'EAGLE'
    ],
    hard: [
      'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE', 'CHIMPANZEE', 'ORANGUTAN',
      'HUMMINGBIRD', 'DRAGONFLY', 'CHAMELEON', 'PORCUPINE', 'ARMADILLO',
      'FLAMINGO', 'HEDGEHOG', 'MONGOOSE', 'NIGHTINGALE', 'SALAMANDER'
    ]
  },
  // Five Pillars of Islam
  fivePillars: {
    easy: [
      'SHAHADA', 'SALAT', 'ZAKAT', 'SAWM', 'HAJJ'
    ],
    medium: [
      'FAITH', 'PRAYER', 'CHARITY', 'FASTING', 'PILGRIMAGE'
    ],
    hard: [
      'TESTIMONY', 'NAMAZ', 'ALMSGIVING', 'RAMADAN', 'MAKKAH'
    ]
  },
  // Prophets of Islam
  islamicProphets: {
    easy: [
      'ADAM', 'NUH', 'IBRAHIM', 'MUSA', 'ISA', 'MUHAMMAD', 'YUNUS', 'YUSUF', 'DAWOOD', 'SULEIMAN'
    ],
    medium: [
      'HUD', 'SALEH', 'LOT', 'ISMAIL', 'ISHAQ', 'YAQUB', 'HARUN', 'AYYUB',
      'IDRIS', 'ZAKARIYA', 'YAHYA', 'ILYAS', 'ALYASA', 'DHULKIFL', 'SHUAIB'
    ],
    hard: [
      'LUQMAN', 'UZAIR', 'DHULQARNAIN', 'TALUT', 'JALUT', 'ABRAHAMIC',
      'MUHAMMADAN', 'PROPHETHOOD', 'MESSENGERSHIP', 'REVELATION',
      'MAKHRAJ', 'GHUNNAH', 'IDGHAM', 'IKHFA', 'QALQALAH', 'WAQF'
    ]
  },
  // Islamic Months
  islamicMonths: {
    easy: [
      'MUHARRAM', 'SAFAR', 'RABIULAWAL', 'RABIULTHANI', 'JUMADAALAWAL',
      'JUMADAALTHANI', 'RAJAB', 'SHAABAN', 'RAMADAN', 'SHAWWAL'
    ],
    medium: [
      'DHULQAADAH', 'DHULHIJJAH', 'ISRA', 'MIRAJ', 'LAILATULQADR',
      'EIDULFITR', 'EIDULADHA', 'ASHURA', 'LAILATULMIRAJ', 'LAILATULBARAT'
    ],
    hard: [
      'MUHARRAMULHARAM', 'SAFARULMUZAFFAR', 'RABIULAWWAL', 'RABIULAKHIR',
      'JUMADALAWAL', 'JUMADALAKHIR', 'RAJABULMURAJJAB', 'SHABANULKARIM',
      'RAMADANULMUBARAK', 'SHAWWALULMUZAMMAL', 'DHULQAADAH', 'DHULHIJJAH'
    ]
  },
  // Muslim Scientists
  muslimScientists: {
    easy: [
      'IBN SINA', 'AL KHAWARIZMI', 'IBN AL HAYTHAM', 'JABIR IBN HAYYAN',
      'AL ZAHRAWI', 'AL BIRUNI', 'UMAR AL KHAYYAM', 'AL IDRISI'
    ],
    medium: [
      'IBN RUSHD', 'IBN AL NAFIS', 'AL RAZI', 'IBN BATTUTA', 'AL KINDI',
      'AL FARABI', 'IBN KHALDUN', 'IBN AL BAYTAR', 'AL JAZARI', 'AL KARAJI'
    ],
    hard: [
      'IBN AL NAQASH', 'AL KHUWARIZMI', 'IBN AL SHATIR', 'AL MAJUSI',
      'IBN TUFAYL', 'IBN ZUHR', 'AL MASUDI', 'AL BATTANI', 'IBN AL QUFF',
      'IBN JAZLAH', 'AL TUSI', 'IBN AL HAJAR', 'IBN AL QUFF', 'IBN AL QUFF'
    ]
  },
  // Islamic Places
  islamicPlaces: {
    easy: [
      'MAKKAH', 'MADINAH', 'JERUSALEM', 'AL AQSA', 'KAABA', 'MASJID NABAWI'
    ],
    medium: [
      'SAFA', 'MARWA', 'HIRA', 'THAWR', 'MINA', 'ARAFAT', 'MUZDALIFAH',
      'JANNATULBAQI', 'JANNATULMUALLAA', 'MASJID AL QUBA'
    ],
    hard: [
      'MASJID AL HARAM', 'MASJID AL NABAWI', 'MASJID AL AQSA', 'JABAL AL NOOR',
      'JABAL AL THAWR', 'JABAL AL RAHMAH', 'JANNAT AL BAGI', 'JANNAT AL MUALLAA',
      'MAQAM IBRAHIM', 'ZAMZAM'
    ]
  },
  // Quranic Surahs
  quranicSurahs: {
    easy: [
      'FATIHA', 'IKHLAS', 'FALAQ', 'NAAS', 'KAWTHAR', 'MASAD', 'QURAISH',
      'MAUN', 'KAUTHAR', 'KAFIRUN'
    ],
    medium: [
      'YASIN', 'MULK', 'RAHMAN', 'WAQIAH', 'MULK', 'MUTAFFIFIN', 'INFITAR',
      'TAKWEER', 'NAZIAT', 'ABASA'
    ],
    hard: [
      'BAQARAH', 'AL IMRAN', 'NISA', 'MAIDAH', 'ANAM', 'ARAF', 'ANFAL',
      'TAWBAH', 'YUNUS', 'HUD', 'YUSUF', 'IBRAHIM', 'HJJ', 'MUJADILA', 'HASHR'
    ]
  },
  // Islamic Values
  islamicValues: {
    easy: [
      'SABR', 'SHUKR', 'TAQWA', 'TAWAKKUL', 'IKHLAS', 'SIDQ', 'AMANAH',
      'ISTIQAMAH', 'TAWADHU', 'HILM'
    ],
    medium: [
      'RAHMAH', 'AFW', 'KARAM', 'SYAJAHAH', 'MURUA', 'WAFAA', 'ADL',
      'IHSAN', 'ITQAN', 'ISTIQAMAH'
    ],
    hard: [
      'TAQWA', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR',
      'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR'
    ]
  },
  // Islamic Terms (legacy category kept for backward compatibility)
  islamicTerms: {
    easy: [
      'SALAM', 'DUA', 'ADHAN', 'IMAM', 'MASJID', 'QURAN', 'HADITH', 'SUNNAH', 'TAWHEED', 'SHIRK'
    ],
    medium: [
      'TAQWA', 'TAWAKKUL', 'SABR', 'SHUKR', 'IKHLAS', 'SIDQ', 'AMANAH', 'ISTIQAMAH', 'TAWADHU', 'HILM'
    ],
    hard: [
      'MUHASABAH', 'TADABBUR', 'TAFKIR', 'TADABBUR', 'TADABBUR', 'TADABBUR',
      'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR', 'TADABBUR'
    ]
  },
  // Islamic Angels
  islamicAngels: {
    easy: [
      'JIBREEL', 'MIKAEEL', 'ISRAFEEL', 'IZRAEEL', 'MUNKAR', 'NAKIR'
    ],
    medium: [
      'RAQEEB', 'ATEED', 'RIDWAN', 'MALIK', 'HARUT', 'MARUT'
    ],
    hard: [
      'KIRAMAN', 'KATIBIN', 'MAALIK', 'ZABANIYAH', 'HAFAZA', 'MUAQQIBAT'
    ]
  },
  // Islamic Books
  islamicBooks: {
    easy: [
      'QURAN', 'TAWRAT', 'INJEEL', 'ZABUR', 'SUHUF', 'HADITH'
    ],
    medium: [
      'SAHIH BUKHARI', 'SAHIH MUSLIM', 'MUWATTA', 'TAFSIR', 'SUNAN', 'MUSNAD'
    ],
    hard: [
      'RIYADUSSALIHIN', 'BULUGHULMARAM', 'MISHKATUL', 'MASABIH', 'IHYA', 'ULUMUDDIN'
    ]
  },
  // Islamic Events
  islamicEvents: {
    easy: [
      'ISRA MIRAJ', 'BADR', 'UHUD', 'KHANDAQ', 'HUDAIBIYAH', 'FATH MAKKAH'
    ],
    medium: [
      'HIJRAH', 'GHADEER', 'MUBAHALA', 'ASHURA', 'TABUK', 'HUNAIN'
    ],
    hard: [
      'YARMUK', 'QADISIYYAH', 'NAHAWAND', 'SIFFIN', 'KARBALA', 'TAIF'
    ]
  },
  // Islamic Virtues
  islamicVirtues: {
    easy: [
      'TAQWA', 'IHSAN', 'RAHMAH', 'ADAALAH', 'ISTIQAMAH', 'ZUHD'
    ],
    medium: [
      'KHUSHOO', 'MUJAHADAH', 'SHUKR', 'TAWBAH', 'WARA', 'QANAAH'
    ],
    hard: [
      'MURAQABAH', 'MUHASABAH', 'IKHBAT', 'YAQEEN', 'TASLEEM', 'RIDHA'
    ]
  }
};

export const THEMES = {
  midnight: {
    background: 'linear-gradient(135deg, #000000 0%, #1e1b4b 50%, #000000 100%)',
    primary: '#ffffff',
    secondary: '#a855f7',
    accent: '#ec4899',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Inter', sans-serif"
  },
  royal: {
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 30%, #312e81 70%, #000000 100%)',
    primary: '#ffffff',
    secondary: '#3b82f6',
    accent: '#ec4899',
    gridBg: 'rgba(255, 255, 255, 0.15)',
    cellBg: 'rgba(255, 255, 255, 0.08)',
    cellHover: 'rgba(255, 255, 255, 0.25)',
    font: "'Inter', sans-serif"
  },
  pink: {
    background: 'linear-gradient(135deg, #000000 0%, #831843 30%, #be185d 70%, #000000 100%)',
    primary: '#ffffff',
    secondary: '#f472b6',
    accent: '#3b82f6',
    gridBg: 'rgba(255, 255, 255, 0.15)',
    cellBg: 'rgba(255, 255, 255, 0.08)',
    cellHover: 'rgba(255, 255, 255, 0.25)',
    font: "'Quicksand', sans-serif"
  },
  pure: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
    primary: '#000000',
    secondary: '#1e3a8a',
    accent: '#be185d',
    gridBg: 'rgba(0, 0, 0, 0.05)',
    cellBg: 'rgba(0, 0, 0, 0.02)',
    cellHover: 'rgba(0, 0, 0, 0.1)',
    font: "'Inter', sans-serif"
  },
  darkRoyal: {
    background: 'linear-gradient(135deg, #000000 0%, #0f1e4b 40%, #0a1229 100%)',
    primary: '#ffffff',
    secondary: '#4f6bff',
    accent: '#00d4ff',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Poppins', sans-serif"
  },
  darkPink: {
    background: 'linear-gradient(135deg, #000000 0%, #4a0d25 40%, #2d0a17 100%)',
    primary: '#ffffff',
    secondary: '#ff6b9d',
    accent: '#ff3d7f',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Quicksand', sans-serif"
  },
  ocean: {
    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
    primary: '#ffffff',
    secondary: '#06b6d4',
    accent: '#0891b2',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Inter', sans-serif"
  },
  sunset: {
    background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #dc2626 100%)',
    primary: '#ffffff',
    secondary: '#f97316',
    accent: '#eab308',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Inter', sans-serif"
  },
  neon: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    primary: '#00ff88',
    secondary: '#ff0080',
    accent: '#00d4ff',
    gridBg: 'rgba(0, 255, 136, 0.1)',
    cellBg: 'rgba(0, 255, 136, 0.05)',
    cellHover: 'rgba(0, 255, 136, 0.2)',
    font: "'Orbitron', sans-serif"
  },
  forest: {
    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
    primary: '#ffffff',
    secondary: '#74c69d',
    accent: '#f9c74f',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Nunito', sans-serif"
  },
  galaxy: {
    background: 'linear-gradient(135deg, #0f0e17 0%, #232946 50%, #121063 100%)',
    primary: '#fffffe',
    secondary: '#7f5af0',
    accent: '#2cb67d',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Space Grotesk', sans-serif"
  },
  desert: {
    background: 'linear-gradient(135deg, #7f5539 0%, #a68a64 50%, #dda15e 100%)',
    primary: '#ffffff',
    secondary: '#bc6c25',
    accent: '#606c38',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Quicksand', sans-serif"
  },
  cyber: {
    background: 'linear-gradient(135deg, #240046 0%, #3c096c 50%, #5a189a 100%)',
    primary: '#e0aaff',
    secondary: '#7b2cbf',
    accent: '#10002b',
    gridBg: 'rgba(224, 170, 255, 0.1)',
    cellBg: 'rgba(224, 170, 255, 0.05)',
    cellHover: 'rgba(224, 170, 255, 0.2)',
    font: "'Rajdhani', sans-serif"
  },
  custom: {
    background: 'linear-gradient(135deg, #000000 0%, #1e1b4b 50%, #000000 100%)',
    primary: '#ffffff',
    secondary: '#a855f7',
    accent: '#ec4899',
    gridBg: 'rgba(255, 255, 255, 0.1)',
    cellBg: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    font: "'Inter', sans-serif"
  }
};

export const WORD_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#10ac84', '#ee5a24', '#0abde3', '#3867d6', '#8854d0'
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  goal?: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  difficulty: Difficulty;
  timeElapsed: number;
  wordsFound: number;
  totalWords: number;
  date: number;
  hintsUsed: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Complete your first word search puzzle',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete an easy puzzle in under 60 seconds',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Complete a hard puzzle without using hints',
    icon: '🧠',
    unlocked: false
  },
  {
    id: 'perfect_streak',
    title: 'Perfect Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    goal: 3
  },
  {
    id: 'time_challenge',
    title: 'Beat the Clock',
    description: 'Complete a puzzle in countdown mode',
    icon: '⏱️',
    unlocked: false
  },
  {
    id: 'word_collector',
    title: 'Word Collector',
    description: 'Find a total of 50 words across all games',
    icon: '📚',
    unlocked: false,
    progress: 0,
    goal: 50
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Score over 1000 points in a single game',
    icon: '🌟',
    unlocked: false
  },
  {
    id: 'theme_explorer',
    title: 'Theme Explorer',
    description: 'Play with 5 different themes',
    icon: '🎨',
    unlocked: false,
    progress: 0,
    goal: 5
  }
];