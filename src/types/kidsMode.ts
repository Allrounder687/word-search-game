// Kids Mode definitions and data

// Define types for the dictionaries
export type IslamicTerm =
    | 'SHAHADA' | 'SALAT' | 'ZAKAT' | 'SAWM' | 'HAJJ'
    | 'ALLAH' | 'QURAN' | 'PROPHET' | 'MUHAMMAD' | 'MASJID'
    | 'WUDU' | 'KAABA' | 'RAMADAN' | 'EID' | 'DEEN';

export type AudioTerm =
    | 'SHAHADA' | 'SALAT' | 'ZAKAT' | 'SAWM' | 'HAJJ'
    | 'ALLAH' | 'QURAN' | 'MUHAMMAD' | 'MASJID'
    | 'KAABA' | 'RAMADAN' | 'EID';

export type IllustrationTerm =
    | 'SHAHADA' | 'SALAT' | 'ZAKAT' | 'SAWM' | 'HAJJ'
    | 'MASJID' | 'KAABA' | 'QURAN' | 'WUDU';

// Simplified Islamic terms for kids
export const KIDS_ISLAMIC_TERMS: Record<IslamicTerm, string> = {
    // Five Pillars simplified
    'SHAHADA': 'Saying "There is no god but Allah, and Muhammad is His messenger"',
    'SALAT': 'Praying five times every day',
    'ZAKAT': 'Sharing money with people who need help',
    'SAWM': 'Not eating or drinking during daylight in Ramadan',
    'HAJJ': 'Visiting the Kaaba in Makkah',

    // Basic Islamic concepts
    'ALLAH': 'The One God who created everything',
    'QURAN': 'The holy book of Islam',
    'PROPHET': 'Someone who delivers Allah\'s message',
    'MUHAMMAD': 'The last prophet of Islam',
    'MASJID': 'A place where Muslims pray together',
    'WUDU': 'Washing before prayer',
    'KAABA': 'The cube-shaped building in Makkah',
    'RAMADAN': 'The month when Muslims fast',
    'EID': 'A special celebration for Muslims',
    'DEEN': 'The way of life in Islam'
};

// Audio pronunciations for Islamic terms
export const AUDIO_PRONUNCIATIONS: Record<AudioTerm, string> = {
    'SHAHADA': 'shahada.mp3',
    'SALAT': 'salat.mp3',
    'ZAKAT': 'zakat.mp3',
    'SAWM': 'sawm.mp3',
    'HAJJ': 'hajj.mp3',
    'ALLAH': 'allah.mp3',
    'QURAN': 'quran.mp3',
    'MUHAMMAD': 'muhammad.mp3',
    'MASJID': 'masjid.mp3',
    'KAABA': 'kaaba.mp3',
    'RAMADAN': 'ramadan.mp3',
    'EID': 'eid.mp3'
};

// Visual illustrations for Islamic concepts
export const VISUAL_ILLUSTRATIONS: Record<IllustrationTerm, string> = {
    'SHAHADA': 'shahada-illustration.png',
    'SALAT': 'salat-illustration.png',
    'ZAKAT': 'zakat-illustration.png',
    'SAWM': 'sawm-illustration.png',
    'HAJJ': 'hajj-illustration.png',
    'MASJID': 'masjid-illustration.png',
    'KAABA': 'kaaba-illustration.png',
    'QURAN': 'quran-illustration.png',
    'WUDU': 'wudu-illustration.png'
};

// Achievement badges for kids
export interface KidsAchievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requiredWords: string[];
    unlocked: boolean;
}

export const KIDS_ACHIEVEMENTS: KidsAchievement[] = [
    {
        id: 'junior_hafiz',
        title: 'Junior Hafiz',
        description: 'Found 5 words related to the Quran',
        icon: '📖',
        requiredWords: ['QURAN', 'SURAH', 'AYAH', 'READ', 'RECITE'],
        unlocked: false
    },
    {
        id: 'little_scholar',
        title: 'Little Scholar',
        description: 'Found all Five Pillars of Islam',
        icon: '🕌',
        requiredWords: ['SHAHADA', 'SALAT', 'ZAKAT', 'SAWM', 'HAJJ'],
        unlocked: false
    },
    {
        id: 'young_explorer',
        title: 'Young Explorer',
        description: 'Found 5 Islamic places',
        icon: '🧭',
        requiredWords: ['MAKKAH', 'MADINAH', 'KAABA', 'MASJID', 'QUDS'],
        unlocked: false
    },
    {
        id: 'prayer_champion',
        title: 'Prayer Champion',
        description: 'Found all 5 daily prayers',
        icon: '🙏',
        requiredWords: ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'],
        unlocked: false
    },
    {
        id: 'ramadan_star',
        title: 'Ramadan Star',
        description: 'Found 5 words related to Ramadan',
        icon: '🌙',
        requiredWords: ['RAMADAN', 'FAST', 'IFTAR', 'SUHOOR', 'EID'],
        unlocked: false
    }
];

// Helper function to check if a word should use kids mode description
export function shouldUseKidsDescription(word: string, kidsMode: boolean): boolean {
    return kidsMode && word in KIDS_ISLAMIC_TERMS;
}

// Helper function to get kids description for a word
export function getKidsDescription(word: string): string | undefined {
    return word in KIDS_ISLAMIC_TERMS ? KIDS_ISLAMIC_TERMS[word as IslamicTerm] : undefined;
}

// Helper function to get audio file for a word
export function getAudioFile(word: string): string | undefined {
    return word in AUDIO_PRONUNCIATIONS ? AUDIO_PRONUNCIATIONS[word as AudioTerm] : undefined;
}

// Helper function to get illustration for a word
export function getIllustration(word: string): string | undefined {
    return word in VISUAL_ILLUSTRATIONS ? VISUAL_ILLUSTRATIONS[word as IllustrationTerm] : undefined;
}

// Helper function to check for achievements
export function checkForAchievements(foundWords: string[]): KidsAchievement[] {
    return KIDS_ACHIEVEMENTS.map(achievement => {
        const requiredWordsFound = achievement.requiredWords.every(word =>
            foundWords.includes(word)
        );

        return {
            ...achievement,
            unlocked: requiredWordsFound
        };
    });
}