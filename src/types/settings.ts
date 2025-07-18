import type { GameSettings, Difficulty, Theme } from './game';

export interface SavedWordList {
  id: string;
  name: string;
  settings: GameSettings;
  createdAt: number;
}

export interface SettingsModalState {
  showCustomTheme: boolean;
  showSaveListModal: boolean;
  showLoadListModal: boolean;
  customWord: string;
  listNameInput: string;
  selectedListId: string | null;
}

export interface CustomColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
}

export interface WordCategoryOption {
  value: string;
  label: string;
  description: string;
}

export interface ThemeOption {
  value: Theme;
  label: string;
  colors: string[];
}

export interface FontOption {
  value: string;
  label: string;
}

// Validation schemas
export const validateCustomWord = (word: string): boolean => {
  return word.trim().length >= 3 && /^[A-Za-z]+$/.test(word.trim());
};

export const validateListName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 50;
};

export const validateHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};