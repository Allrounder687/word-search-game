import type { GameSettings } from '../types/game';
import { validateCustomWord, validateHexColor } from '../types/settings';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateGameSettings = (settings: GameSettings): ValidationResult => {
  const errors: string[] = [];

  // Validate grid size
  if (settings.difficulty === 'custom') {
    if (!settings.gridSize || settings.gridSize < 8 || settings.gridSize > 20) {
      errors.push('Grid size must be between 8 and 20');
    }
  }

  // Validate custom words
  if (settings.difficulty === 'custom' && settings.customWords) {
    if (settings.customWords.length === 0) {
      errors.push('At least one custom word is required');
    }
    
    const invalidWords = settings.customWords.filter(word => !validateCustomWord(word));
    if (invalidWords.length > 0) {
      errors.push(`Invalid words: ${invalidWords.join(', ')}`);
    }
  }

  // Validate timer settings
  if (settings.timerMode === 'countdown') {
    if (!settings.timerDuration || settings.timerDuration < 30 || settings.timerDuration > 3600) {
      errors.push('Timer duration must be between 30 seconds and 1 hour');
    }
  }

  // Validate hints count
  if (settings.hintsCount !== undefined && (settings.hintsCount < 0 || settings.hintsCount > 10)) {
    errors.push('Hints count must be between 0 and 10');
  }

  // Validate custom colors
  if (settings.theme === 'custom' && settings.customColors) {
    const colorEntries = Object.entries(settings.customColors);
    const invalidColors = colorEntries.filter(([_, color]) => !validateHexColor(color));
    
    if (invalidColors.length > 0) {
      errors.push(`Invalid color values: ${invalidColors.map(([key]) => key).join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeGameSettings = (settings: GameSettings): GameSettings => {
  const sanitized = { ...settings };

  // Sanitize custom words
  if (sanitized.customWords) {
    sanitized.customWords = sanitized.customWords
      .map(word => word.trim().toUpperCase())
      .filter(word => validateCustomWord(word))
      .slice(0, 25); // Limit to 25 words max
  }

  // Sanitize grid size
  if (sanitized.gridSize) {
    sanitized.gridSize = Math.max(8, Math.min(20, sanitized.gridSize));
  }

  // Sanitize timer duration
  if (sanitized.timerDuration) {
    sanitized.timerDuration = Math.max(30, Math.min(3600, sanitized.timerDuration));
  }

  // Sanitize hints count
  if (sanitized.hintsCount !== undefined) {
    sanitized.hintsCount = Math.max(0, Math.min(10, sanitized.hintsCount));
  }

  return sanitized;
};