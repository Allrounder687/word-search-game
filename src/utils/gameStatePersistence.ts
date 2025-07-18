import type { GameState } from '../types/game';

export const GAME_STATE_KEY = 'wordSearchGameState';

export const saveGameState = (state: GameState) => {
  try {
    // Convert Set to array before saving
    const saveState = {
      ...state,
      foundWords: Array.from(state.foundWords)
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(saveState));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (!savedState) return null;
    
    const parsedState = JSON.parse(savedState);
    
    // Validate the loaded state
    if (!parsedState || 
        !Array.isArray(parsedState.grid) ||
        !Array.isArray(parsedState.words) ||
        !('foundWords' in parsedState) ||
        !('settings' in parsedState)) {
      return null;
    }

    // Convert foundWords array back to Set
    if (Array.isArray(parsedState.foundWords)) {
      parsedState.foundWords = new Set(parsedState.foundWords);
    } else {
      console.error('Invalid foundWords format in saved state');
      return null;
    }

    return parsedState as GameState;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = () => {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};
