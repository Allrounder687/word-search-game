import { THEMES } from '../types/game';
import type { Theme } from '../types/game';

interface CustomColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
}

export class ThemeFactory {
  static createTheme(themeName: Theme, customColors?: CustomColors) {
    const baseTheme = THEMES[themeName] || THEMES.midnight;
    
    if (themeName === 'custom' && customColors) {
      return {
        ...baseTheme,
        background: customColors.background,
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.accent,
        gridBg: 'rgba(255, 255, 255, 0.1)',
        cellBg: 'rgba(255, 255, 255, 0.05)',
        cellHover: 'rgba(255, 255, 255, 0.2)',
      };
    }
    
    return baseTheme;
  }

  static validateCustomColors(colors: CustomColors): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    return Object.values(colors).every(color => 
      hexColorRegex.test(color)
    );
  }

  static getThemePreview(themeName: Theme, customColors?: CustomColors) {
    const theme = this.createTheme(themeName, customColors);
    return {
      background: theme.background,
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent
    };
  }
}