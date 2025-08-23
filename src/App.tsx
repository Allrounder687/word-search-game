import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LevelSystem } from './components/LevelSystem';
import { KidsAchievements } from './components/KidsAchievements';
import { OrientationWarning } from './components/OrientationWarning';
import { QuickSettings } from './components/QuickSettings';
import {
  MemoizedWordGrid as WordGrid,
  MemoizedWordList as WordList,
  MemoizedGameHeader as GameHeader,
  MemoizedSettingsModal as SettingsModal,
  MemoizedHintSystem as HintSystem,
  MemoizedAchievementSystem as AchievementSystem,
  MemoizedLeaderboardSystem as LeaderboardSystem
} from './components/MemoizedComponents';
import { WordSearchGenerator, calculateScore } from './utils/gameLogic';
import { initializeMobileOptimizations } from './utils/mobileOptimizations';
import { setupMobileViewport } from './utils/responsiveLayout';
import { useResponsive } from './hooks/useResponsive';

import type { GameState, GameSettings, WordPlacement } from './types/game';
import { THEMES } from './types/game';
import { getCachedDescriptions, preloadCriticalDescriptions } from './utils/lazyDataLoader';
import { usePerformanceMonitor } from './utils/performanceMonitor';
import { Sparkles, Trophy, Clock } from 'lucide-react';
import { saveGameState, loadGameState, clearGameState } from './utils/gameStatePersistence';

function App() {
  const timeElapsedRef = useRef(0);
  // Load saved game state on mount
  const savedState = loadGameState();
  const [gameState, setGameState] = useState<GameState>(
    savedState || {
      grid: [],
      words: [],
      foundWords: new Set(),
      score: 0,
      isComplete: false,
      currentSelection: [],
      settings: {
        difficulty: 'easy',
        theme: 'midnight',
        gridSize: 10,
        wordCategory: 'fivePillars',
        showDescriptions: true // Enable descriptions by default
      }
    }
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isClickMode] = useState(false);
  const [selectedDescriptionWord, setSelectedDescriptionWord] = useState<string | null>(null);

  // Use responsive hook for better performance and maintainability
  const breakpoints = useResponsive();
  
  // Performance monitoring
  const { markGameStart, logReport } = usePerformanceMonitor();

  // Memoize theme and layout calculations
  const currentTheme = useMemo(() =>
    THEMES[gameState.settings.theme] || THEMES.midnight,
    [gameState.settings.theme]
  );

  // State for lazy-loaded descriptions
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});

  // Load descriptions dynamically when category changes
  useEffect(() => {
    const loadCategoryDescriptions = async () => {
      try {
        if (gameState.settings.wordCategory) {
          const newDescriptions = await getCachedDescriptions(gameState.settings.wordCategory);
          setDescriptions(newDescriptions);
        }
      } catch (error) {
        console.warn('Failed to load descriptions:', error);
        setDescriptions({});
      }
    };

    loadCategoryDescriptions();
  }, [gameState.settings.wordCategory]);

  // Preload critical descriptions on app start
  useEffect(() => {
    preloadCriticalDescriptions().catch(console.warn);
    markGameStart();
    
    // Log performance report after 5 seconds
    const timer = setTimeout(() => {
      logReport();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [markGameStart, logReport]);

  // Initialize timer based on settings
  useEffect(() => {
    // Reset game over state
    setGameOver(false);

    // Handle countdown timer initialization
    if (gameState.settings.timerMode === 'countdown' && gameState.settings.timerDuration) {
      setTimeRemaining(gameState.settings.timerDuration);
    } else {
      setTimeRemaining(null);
    }
  }, [gameState.settings.timerMode, gameState.settings.timerDuration]);

  // Timer effect
  useEffect(() => {
    // Don't run timer if game is complete or game over
    if (gameState.isComplete || gameOver) return;

    // Create timer interval
    const timer = setInterval(() => {
      // Countdown timer
      if (gameState.settings.timerMode === 'countdown' && timeRemaining !== null) {
        setTimeRemaining(prev => {
          // Handle the case where prev might be null
          const currentTime = prev ?? 0;
          if (currentTime <= 1) {
            // Time's up!
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return currentTime - 1;
        });
      }
    }, 1000);

    // Cleanup timer on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [gameState.isComplete, gameState.settings.timerMode, gameOver, timeRemaining]);

  // Initialize game - memoized with proper dependencies
  const initializeGame = useCallback((settings?: GameSettings) => {
    timeElapsedRef.current = 0;
    const gameSettings = settings || gameState.settings;
    const gridSize = gameSettings.difficulty === 'custom'
      ? gameSettings.gridSize
      : gameSettings.difficulty === 'easy' ? 10
        : gameSettings.difficulty === 'medium' ? 12 : 15;

    const generator = new WordSearchGenerator(gridSize);
    const { grid, words } = generator.generateGame(gameSettings);

    // Reset game state
    setGameState({
      grid,
      words,
      foundWords: new Set(),
      score: 0,
      isComplete: false,
      currentSelection: [],
      settings: gameSettings
    });

    // Reset game over state
    setGameOver(false);

    // Reset timer based on mode
    if (gameSettings.timerMode === 'countdown' && gameSettings.timerDuration) {
      setTimeRemaining(gameSettings.timerDuration);
    } else {
      setTimeRemaining(null);
    }
  }, [gameState.settings]); // Add dependency to prevent stale closure

  // Initialize game and mobile optimizations on mount
  useEffect(() => {
    // Initialize the game
    initializeGame();

    // Initialize mobile optimizations
    initializeMobileOptimizations();

    // Setup mobile viewport for better mobile experience
    setupMobileViewport();
  }, [initializeGame]);

  // Save game state whenever it changes (except during initialization)
  useEffect(() => {
    // Skip saving during initial load
    if (savedState && Object.keys(savedState).length > 0) {
      saveGameState(gameState);
    }
  }, [gameState, savedState]);

  const handleWordFound = useCallback((word: WordPlacement) => {
    // Update state with the found word in a single setState call
    setGameState(prev => {
      const newFoundWords = new Set(prev.foundWords);
      newFoundWords.add(word.word);

      const updatedWords = prev.words.map(w =>
        w.word === word.word ? { ...w, found: true } : w
      );

      const newScore = calculateScore(
        newFoundWords,
        timeElapsedRef.current,
        prev.settings.difficulty
      );

      const isComplete = newFoundWords.size === prev.words.length;

      // Handle celebrations and achievements if game is complete
      if (isComplete) {
        // Show celebration animation (in a setTimeout to avoid state updates during render)
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }, 0);

        // Unlock achievements
        if (window.achievementSystem) {
          // First win achievement
          window.achievementSystem.unlockAchievement('first_win');

          // Speed demon achievement (complete easy puzzle in under 60 seconds)
          if (prev.settings.difficulty === 'easy' && timeElapsedRef.current < 60) {
            window.achievementSystem.unlockAchievement('speed_demon');
          }

          // Perfect score achievement (complete medium puzzle with max score)
          if (prev.settings.difficulty === 'medium' && newScore === 1000) {
            window.achievementSystem.unlockAchievement('perfect_score');
          }
        }
      }

      // Create the new state
      const newState = {
        ...prev,
        words: updatedWords,
        foundWords: newFoundWords,
        score: newScore,
        isComplete
      };

      // Save the state immediately
      saveGameState(newState);

      // Return the new state
      return newState;
    });
  }, []);

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    initializeGame(newSettings);
  }, [initializeGame]);

  const handleReset = useCallback(() => {
    initializeGame();
    // Clear saved state when resetting
    clearGameState();
  }, [initializeGame]);

  // Apply theme to body
  useEffect(() => {
    const root = document.documentElement;
    if (root) {
      Object.entries(currentTheme).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, [currentTheme]);

  // Handle hint usage
  const handleHintUsed = useCallback((word: WordPlacement) => {
    if (hintsRemaining > 0) {
      setHintsRemaining(prev => {
        if (prev > 0) {
          return prev - 1;
        }
        return prev;
      });

      // Highlight the first letter of the word
      const firstLetterPos = word.start;
      const cellKey = `${firstLetterPos.row},${firstLetterPos.col}`;
      const cell = document.querySelector(`[data-cell="${cellKey}"]`);

      if (cell) {
        cell.classList.add('animate-pulse-glow');
        setTimeout(() => {
          cell.classList.remove('animate-pulse-glow');
        }, 3000);
      }
    }
  }, [hintsRemaining, setHintsRemaining]);

  // Reset hints when starting a new game
  useEffect(() => {
    // If hintsCount is explicitly set in settings, use that value
    if (gameState.settings.hintsCount !== undefined) {
      setHintsRemaining(gameState.settings.hintsCount);
    } else {
      // Otherwise use default values based on difficulty
      const difficultyHints = {
        'easy': 3,
        'medium': 2,
        'hard': 1,
        'custom': 2
      };
      setHintsRemaining(difficultyHints[gameState.settings.difficulty] || 3);
    }
  }, [gameState.settings.difficulty, gameState.settings.hintsCount]);

  // Handle zoom toggle
  const onToggleZoom = useCallback(() => {
    setIsZoomed(prev => !prev);
  }, []);



  return (
    <div
      className="game-container"
      style={{
        minHeight: '100vh',
        padding: '16px',
        fontFamily: 'var(--font, Inter, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--background)',
        color: 'var(--primary)'
      }}
    >
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto'
      }}>
        <GameHeader
          score={gameState.score}
          timeElapsed={timeElapsedRef.current}
          onTimeUpdate={(time) => timeElapsedRef.current = time}
          isGameActive={!gameState.isComplete && !gameOver}
          foundWords={gameState.foundWords.size}
          totalWords={gameState.words.length}
          onReset={handleReset}
          onSettings={() => setShowSettings(true)}
          onToggleZoom={onToggleZoom}
          isZoomed={isZoomed}
          isClickMode={isClickMode}
          theme={currentTheme}
          isDesktop={breakpoints.isDesktop}
          timeRemaining={timeRemaining}
        />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-4 p-4">
        {/* Left Column: Controls */}
        <div className="w-full flex flex-col gap-4 order-2 lg:order-1">
          <QuickSettings
            settings={gameState.settings}
            onSettingsChange={handleSettingsChange}
            theme={currentTheme}
            onReset={handleReset}
            onToggleZoom={onToggleZoom}
            isZoomed={isZoomed}
            isClickMode={isClickMode}
          />
          <div className="p-4 rounded-xl shadow-lg flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--gridBg)' }}>
            <HintSystem
              words={gameState.words}
              onHintUsed={handleHintUsed}
              theme={currentTheme}
              hintsRemaining={hintsRemaining}
            />
            {gameState.settings.timerMode === 'countdown' && timeRemaining !== null && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: timeRemaining < 30 ? 'rgba(239, 68, 68, 0.2)' : 'var(--cellBg)',
                  color: timeRemaining < 30 ? '#ef4444' : 'var(--primary)',
                  border: `1px solid ${timeRemaining < 30 ? '#ef4444' : 'var(--secondary-40)'}`,
                  animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none',
                }}
              >
                <Clock size={20} style={{ color: timeRemaining < 30 ? '#ef4444' : 'var(--secondary)' }} />
                <span className="font-bold text-lg">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl shadow-lg flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--gridBg)' }}>
            <AchievementSystem theme={currentTheme} />
            {gameState.settings.kidsMode && (
              <KidsAchievements
                theme={currentTheme}
                foundWords={Array.from(gameState.foundWords)}
                kidsMode={gameState.settings.kidsMode}
              />
            )}
            <LeaderboardSystem theme={currentTheme} />
            <LevelSystem
              theme={currentTheme}
              onStartLevel={(currentLevel, settings) => {
                const levelSettings = {
                  ...settings,
                  wordCategory: gameState.settings.wordCategory,
                  theme: gameState.settings.theme,
                  showDescriptions: gameState.settings.showDescriptions,
                  timerMode: gameState.settings.timerMode,
                  timerDuration: gameState.settings.timerDuration,
                };
                console.log(`Starting level ${currentLevel}`);
                handleSettingsChange(levelSettings);
              }}
              currentSettings={gameState.settings}
            />
          </div>
        </div>

        {/* Center Column: Word Grid */}
        <div className="w-full flex justify-center items-center order-1 lg:order-2">
          <WordGrid
            grid={gameState.grid}
            words={gameState.words}
            onWordFound={handleWordFound}
            theme={currentTheme}
            descriptions={descriptions}
          />
        </div>

        {/* Right Column: Word List */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 order-3 lg:order-3">
          <WordList
            words={gameState.words}
            theme={currentTheme}
            showDescriptions={gameState.settings.showDescriptions}
            kidsMode={gameState.settings.kidsMode}
            isMobileLayout={!breakpoints.isDesktop}
            descriptions={descriptions}
            selectedWord={selectedDescriptionWord}
            setSelectedWord={setSelectedDescriptionWord}
          />
        </div>
      </div>

        {/* Game Complete Celebration */}
        {gameState.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="text-center animate-float p-8 rounded-xl shadow-2xl"
              style={{
                backgroundColor: 'var(--gridBg-cc)',
                backdropFilter: 'blur(8px)',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'var(--accent-40)'
              }}
            >
              <div className="text-6xl mb-4 flex justify-center">
                <div className="animate-bounce">🎉</div>
                <div className="animate-float" style={{ animationDelay: '0.2s' }}>🏆</div>
                <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
              </div>
              <div
                className="text-4xl font-bold mb-2 animate-rainbow bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font)'
                }}
              >
                Congratulations!
              </div>
              <div className="text-xl opacity-90 mb-2" style={{ color: 'var(--primary)' }}>
                All words found in {Math.floor(timeElapsedRef.current / 60)}:{(timeElapsedRef.current % 60).toString().padStart(2, '0')}
              </div>

              {/* Difficulty Badge */}
              <div className="flex justify-center mb-4">
                <div className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor:
                      gameState.settings.difficulty === 'easy' ? '#10b981' :
                        gameState.settings.difficulty === 'medium' ? '#f59e0b' :
                          gameState.settings.difficulty === 'hard' ? '#ef4444' :
                            '#8b5cf6',
                    color: '#ffffff'
                  }}
                >
                  {gameState.settings.difficulty.charAt(0).toUpperCase() + gameState.settings.difficulty.slice(1)} Mode
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--cellBg)',
                    boxShadow: '0 0 20px var(--accent-40)'
                  }}
                >
                  <Trophy className="animate-pulse" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {gameState.score.toLocaleString()} points
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-6 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 pointer-events-auto"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Celebration Particles */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles
                  size={16 + Math.random() * 16}
                  style={{ color: 'var(--accent)' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Game Over Modal (for countdown timer) */}
        {gameOver && !gameState.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="text-center p-8 rounded-xl shadow-2xl"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: '#ef4444',
                maxWidth: '400px',
                width: '90%'
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'shake 0.5s'
              }}>
                ⏱️
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '16px'
              }}>
                Time's Up!
              </div>
              <div style={{
                fontSize: '16px',
                marginBottom: '24px',
                color: '#ffffff'
              }}>
                You found {gameState.foundWords.size} out of {gameState.words.length} words.
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderWidth: '0',
                    borderStyle: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={gameState.settings}
          onSettingsChange={handleSettingsChange}
          theme={currentTheme}
        />

        {/* CSS Animations */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            
            @keyframes shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              50% { transform: translateX(5px); }
              75% { transform: translateX(-5px); }
              100% { transform: translateX(0); }
            }
            
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            
            @keyframes rainbow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            .animate-pulse {
              animation: pulse 1s infinite;
            }
            
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            
            .animate-rainbow {
              animation: rainbow 6s linear infinite;
            }
            
            .animate-bounce {
              animation: float 1s ease-in-out infinite;
            }
          `}
        </style>
      </div>

      {/* Orientation Warning for Mobile */}
      <OrientationWarning theme={currentTheme} />
    </div>
  );
}

export default App;
