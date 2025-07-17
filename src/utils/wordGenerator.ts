// Define the Difficulty type directly to avoid import issues
type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

// Simple word generator for levels
export class WordGenerator {
  // Track used words to avoid repetition (not used in simplified version)
  // private usedWords: Set<string> = new Set();

  // Generate words for a specific level
  public generateWordsForLevel(level: number): string[] {
    // Determine difficulty based on level
    const difficulty = this.getDifficultyForLevel(level);

    // Determine word count based on level
    const wordCount = Math.min(8 + (level * 2), 25);

    // Generate words
    return this.generateWordsForDifficulty(difficulty, wordCount);
  }

  // Get difficulty based on level
  private getDifficultyForLevel(level: number): Difficulty {
    if (level < 5) {
      return 'easy';
    } else if (level < 10) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  // Generate words for a specific difficulty
  public generateWordsForDifficulty(difficulty: Difficulty, count: number): string[] {
    const words: string[] = [];

    // Simple word lists for each difficulty
    const easyWords = [
      'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'FISH', 'BIRD',
      'BOOK', 'GAME', 'LOVE', 'HOPE', 'PLAY', 'SING', 'DANCE', 'HAPPY',
      'SMILE', 'LIGHT', 'MAGIC', 'DREAM', 'PEACE', 'JOY', 'HEART'
    ];

    const mediumWords = [
      'COMPUTER', 'RAINBOW', 'BUTTERFLY', 'MOUNTAIN', 'OCEAN', 'FOREST',
      'ADVENTURE', 'MYSTERY', 'TREASURE', 'JOURNEY', 'FREEDOM', 'WISDOM',
      'COURAGE', 'HARMONY', 'SERENITY', 'CRYSTAL', 'PHOENIX', 'GALAXY',
      'THUNDER', 'DIAMOND', 'MIRACLE', 'FANTASY', 'DESTINY'
    ];

    const hardWords = [
      'EXTRAORDINARY', 'MAGNIFICENT', 'REVOLUTIONARY', 'SOPHISTICATED',
      'INCOMPREHENSIBLE', 'TRANSFORMATION', 'PHILOSOPHICAL', 'ASTRONOMICAL',
      'ARCHAEOLOGICAL', 'PSYCHOLOGICAL', 'TECHNOLOGICAL', 'ENVIRONMENTAL',
      'INTERNATIONAL', 'CONSTITUTIONAL', 'ENTREPRENEURIAL', 'MULTIDIMENSIONAL',
      'INTERDISCIPLINARY', 'TRANSCENDENTAL', 'METAMORPHOSIS', 'KALEIDOSCOPE'
    ];

    // Islamic words
    const islamicWords = [
      'QURAN', 'SUNNAH', 'HADITH', 'ISLAM', 'IMAN', 'IHSAN', 'HALAL', 'HARAM',
      'WUDU', 'IMAM', 'MASJID', 'SURAH', 'AYAH', 'JANNAH', 'DEEN', 'UMMAH',
      'SALAT', 'ZAKAT', 'SAWM', 'HAJJ', 'MECCA', 'KAABA', 'MEDINA'
    ];

    // Select the appropriate word list
    let wordList: string[];
    switch (difficulty) {
      case 'easy':
        wordList = [...easyWords, ...islamicWords.slice(0, 10)];
        break;
      case 'medium':
        wordList = [...mediumWords, ...islamicWords.slice(10)];
        break;
      case 'hard':
        wordList = hardWords;
        break;
      default:
        wordList = [...easyWords, ...mediumWords];
    }

    // Shuffle the word list
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());

    // Select words, avoiding duplicates
    for (let i = 0; i < count && i < shuffled.length; i++) {
      words.push(shuffled[i]);
    }

    return words;
  }

  // Set categories (simplified version)
  public setCategories(categories: string[]): void {
    // This is a simplified version, so we don't actually use categories
    console.log('Categories set:', categories);
  }
}

// Export a singleton instance
export const wordGenerator = new WordGenerator();