import {
  FIVE_PILLARS_DESCRIPTIONS,
  PROPHETS_DESCRIPTIONS,
  ISLAMIC_MONTHS_DESCRIPTIONS,
  MUSLIM_SCIENTISTS_DESCRIPTIONS,
  ISLAMIC_LANDMARKS_DESCRIPTIONS,
  QURANIC_SURAHS_DESCRIPTIONS,
  ISLAMIC_VALUES_DESCRIPTIONS
} from './islamicDescriptions';

export type IslamicCategory = {
  key: string;
  name: string;
  words: string[];
  descriptions: Record<string, string>;
};

export const ISLAMIC_CATEGORIES: IslamicCategory[] = [
  {
    key: 'five-pillars',
    name: 'Five Pillars of Islam',
    words: [
      'SHAHADA', 'FAITH', 'TESTIMONY',
      'SALAT', 'PRAYER', 'NAMAZ',
      'ZAKAT', 'CHARITY', 'ALMSGIVING',
      'SAWM', 'FASTING', 'RAMADAN',
      'HAJJ', 'PILGRIMAGE', 'MAKKAH'
    ],
    descriptions: FIVE_PILLARS_DESCRIPTIONS
  },
  {
    key: 'prophets',
    name: 'Prophets of Islam',
    words: [
      'ADAM', 'NUH', 'IBRAHIM', 'MUSA', 'ISA', 'MUHAMMAD', 'YUNUS', 'YUSUF', 'DAWOOD', 'SULEIMAN'
    ],
    descriptions: PROPHETS_DESCRIPTIONS
  },
  {
    key: 'islamic-months',
    name: 'Islamic Months',
    words: [
      'MUHARRAM', 'SAFAR', 'RABIULAWAL', 'RABIULTHANI', 'JUMADAALAWAL', 'JUMADAALTHANI', 'RAJAB', 'SHAABAN', 'RAMADAN', 'SHAWWAL', 'DHULQAADAH', 'DHULHIJJAH'
    ],
    descriptions: ISLAMIC_MONTHS_DESCRIPTIONS
  },
  {
    key: 'muslim-scientists',
    name: 'Muslim Scientists & Inventors',
    words: [
      'IBN SINA', 'AL KHAWARIZMI', 'IBN AL HAYTHAM', 'JABIR IBN HAYYAN', 'AL ZAHRAWI', 'AL BIRUNI', 'UMAR AL KHAYYAM', 'AL IDRISI'
    ],
    descriptions: MUSLIM_SCIENTISTS_DESCRIPTIONS
  },
  {
    key: 'islamic-landmarks',
    name: 'Islamic Landmarks',
    words: [
      'KAABA', 'MASJID NABAWI', 'AL AQSA', 'SAFA MARWA', 'JABAL NOOR', 'UHAD'
    ],
    descriptions: ISLAMIC_LANDMARKS_DESCRIPTIONS
  },
  {
    key: 'quranic-surahs',
    name: 'Quranic Surahs',
    words: [
      'FATIHA', 'IKHLAS', 'FALAQ', 'NAAS', 'BAQARAH', 'YASIN', 'KAHF'
    ],
    descriptions: QURANIC_SURAHS_DESCRIPTIONS
  },
  {
    key: 'islamic-values',
    name: 'Islamic Values & Manners',
    words: [
      'SABR', 'SHUKR', 'ADAB', 'IKHLAAS', 'AMANAH', 'SIDQ', 'TAWAKKUL', 'HIYA'
    ],
    descriptions: ISLAMIC_VALUES_DESCRIPTIONS
  }
];
