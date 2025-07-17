import { useState, useCallback } from 'react';
import { WordSearchGenerator, calculateScore } from '../utils/gameLogic';
import type { GameState, GameSettings, WordPlacement } from '../types/game';

interface UseGameStateReturn {
  gameState: GameState;
  initializeGame: (settings?: GameSettings) => void;
  handleWordFound: (word: WordPlacement) => void;
  handleSettingsChange: (newSettings: GameSettings) => void;
  handleReset: () => void;
}

export const useGameState = (
  initialSettings: GameSettings,
  onGameComplete?: (score: number, timeElapsed: number) => void
): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    words: [],
    foundWords: new Set(),
    score: 0,
    timeElapsed: 0,
    isComplete: false,
    currentSelection: [],
    settings: initialSettings
  });

  const initializeGame = useCallback((settings?: GameSettings) => {
    const gameSettings = settings || gameState.settings;
    const gridSize = gameSettings.difficulty === 'custom'
      ? gameSettings.gridSize
      : gameSettings.difficulty === 'easy' ? 10
        : gameSettings.difficulty === 'medium' ? 12 : 15;

    const generator = new WordSearchGenerator(gridSize);
    const { grid, words } = generator.generateGame(gameSettings);

    setGameState({
      grid,
      words,
      foundWords: new Set(),
      score: 0,
      timeElapsed: 0,
      isComplete: false,
      currentSelection: [],
      settings: gameSettings
    });
  }, [gameState.settings]);

  const handleWordFound = useCallback((word: WordPlacement) => {
    setGameState(prev => {
      const newFoundWords = new Set(prev.foundWords);
      newFoundWords.add(word.word);

      const updatedWords = prev.words.map(w =>
        w.word === word.word ? { ...w, found: true } : w
      );

      const newScore = calculateScore(
        newFoundWords,
        prev.timeElapsed,
        prev.settings.difficulty
      );

      const isComplete = newFoundWords.size === prev.words.length;

      if (isComplete && onGameComplete) {
        onGameComplete(newScore, prev.timeElapsed);
      }

      return {
        ...prev,
        words: updatedWords,
        foundWords: newFoundWords,
        score: newScore,
        isComplete
      };
    });
  }, [onGameComplete]);

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    initializeGame(newSettings);
  }, [initializeGame]);

  const handleReset = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    initializeGame,
    handleWordFound,
    handleSettingsChange,
    handleReset
  };
};