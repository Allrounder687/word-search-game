import { useState, useEffect, useCallback, useMemo } from 'react';
import { WordGrid } from './components/WordGrid';
import { WordList } from './components/WordList';
import { GameHeader } from './components/GameHeader';
import { SettingsModal } from './components/SettingsModal';
import { HintSystem } from './components/HintSystem';
import { AchievementSystem } from './components/AchievementSystem';
import { LeaderboardSystem } from './components/LeaderboardSystem';
import { LevelSystem } from './components/LevelSystem';
import { KidsAchievements } from './components/KidsAchievements';
import { OrientationWarning } from './components/OrientationWarning';
import { QuickSettings } from './components/QuickSettings';
import { WordSearchGenerator, calculateScore } from './utils/gameLogic';
import { initializeMobileOptimizations } from './utils/mobileOptimizations';
import { setupMobileViewport } from './utils/responsiveLayout';
import { useResponsive } from './hooks/useResponsive';
import { getLayoutConfig } from './utils/layoutConfig';
import type { GameState, GameSettings, WordPlacement } from './types/game';
import { THEMES } from './types/game';
import { 
  FIVE_PILLARS_DESCRIPTIONS,
  ISLAMIC_MONTHS_DESCRIPTIONS,
  MUSLIM_SCIENTISTS_DESCRIPTIONS,
  PROPHETS_DESCRIPTIONS,
  QURANIC_SURAHS_DESCRIPTIONS,
  ISLAMIC_VALUES_DESCRIPTIONS
} from './types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from './types/islamicPlacesDescriptions';
import { Sparkles, Trophy, Info, Clock } from 'lucide-react';
import { saveGameState, loadGameState, clearGameState } from './utils/gameStatePersistence';

function App() {
  // Load saved game state on mount
  const savedState = loadGameState();
  const [gameState, setGameState] = useState<GameState>(
    savedState || {
      grid: [],
      words: [],
      foundWords: new Set(),
      score: 0,
      timeElapsed: 0,
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
  const [showInfo, setShowInfo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isClickMode, setIsClickMode] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'drag' | 'click-start-end'>('drag');
  const [selectedDescriptionWord, setSelectedDescriptionWord] = useState<string | null>(null);

  // Use responsive hook for better performance and maintainability
  const breakpoints = useResponsive();

  // Memoize theme and layout calculations
  const currentTheme = useMemo(() =>
    THEMES[gameState.settings.theme] || THEMES.midnight,
    [gameState.settings.theme]
  );

  const layoutConfig = useMemo(() =>
    getLayoutConfig(breakpoints, currentTheme),
    [breakpoints, currentTheme]
  );

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

    // Reset timeElapsed for countup mode or when no timer is set
    if (gameState.settings.timerMode !== 'countdown') {
      setGameState(prev => ({
        ...prev,
        timeElapsed: 0
      }));
    }
  }, [gameState.settings.timerMode, gameState.settings.timerDuration]);

  // Timer effect
  useEffect(() => {
    // Don't run timer if game is complete or game over
    if (gameState.isComplete || gameOver) return;

    // Create timer interval
    const timer = setInterval(() => {
      // Count up timer (default or explicitly set to countup)
      if (gameState.settings.timerMode === 'countup' || gameState.settings.timerMode === undefined || gameState.settings.timerMode === 'none') {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }
      // Countdown timer
      else if (gameState.settings.timerMode === 'countdown' && timeRemaining !== null) {
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
  }, [gameState.isComplete, gameState.settings.timerMode, gameOver]);

  // Initialize game - memoized with proper dependencies
  const initializeGame = useCallback((settings?: GameSettings) => {
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
      timeElapsed: 0,
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
  }, []);

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
        prev.timeElapsed,
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
          if (prev.settings.difficulty === 'easy' && prev.timeElapsed < 60) {
            window.achievementSystem.unlockAchievement('speed_demon');
          }

          // Perfect score achievement (complete medium puzzle with max score)
          if (prev.settings.difficulty === 'medium' && prev.score === 1000) {
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
    document.body.style.background = currentTheme.background;
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
  
  // Handle click mode toggle
  const handleToggleClickMode = useCallback(() => {
    const newMode = selectionMode === 'drag' ? 'click-start-end' : 'drag';
    setSelectionMode(newMode);
    setIsClickMode(newMode === 'click-start-end');
  }, [selectionMode]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '16px',
        fontFamily: currentTheme.font || 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto'
      }}>
        <GameHeader
          score={gameState.score}
          timeElapsed={gameState.timeElapsed}
          foundWords={gameState.foundWords.size}
          totalWords={gameState.words.length}
          onReset={handleReset}
          onSettings={() => setShowSettings(true)}
          onToggleZoom={onToggleZoom}
          onToggleClickMode={handleToggleClickMode}
          isZoomed={isZoomed}
          isClickMode={isClickMode}
          theme={currentTheme}
          isDesktop={breakpoints.isDesktop}
          timeRemaining={timeRemaining}
        />

        <div style={{
          display: 'flex',
          flexDirection: breakpoints.isDesktop ? 'row' : 'column',
          gap: layoutConfig.spacing.gap,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: layoutConfig.spacing.marginTop,
          padding: layoutConfig.spacing.padding
        }}>
          <div style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            ...layoutConfig.wordGrid
          }}>
            <WordGrid
              grid={gameState.grid}
              words={gameState.words}
              onWordFound={handleWordFound}
              theme={currentTheme}
              showDescriptions={gameState.settings.showDescriptions}
              kidsMode={gameState.settings.kidsMode}
              isZoomed={isZoomed}
              selectionMode={selectionMode}
              onSelectionModeChange={setSelectionMode}
            />
          </div>

          <div style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Quick Settings for Category and Theme Selection */}
            <QuickSettings
              settings={gameState.settings}
              onSettingsChange={handleSettingsChange}
              theme={currentTheme}
              onReset={handleReset}
              onToggleZoom={onToggleZoom}
              onToggleClickMode={handleToggleClickMode}
              isZoomed={isZoomed}
              isClickMode={isClickMode}
            />

            {/* Get descriptions based on the current category */}
            {useMemo(() => {
              const category = gameState.settings.wordCategory;
              let descriptions: Record<string, string> = {};
              
              // Import descriptions based on the selected category
              if (category === 'fivePillars') {
                descriptions = FIVE_PILLARS_DESCRIPTIONS;
              } else if (category === 'islamicPlaces') {
                // Convert the places descriptions to the expected format
                Object.entries(ISLAMIC_PLACES_DESCRIPTIONS).forEach(([key, value]: [string, { description: string; urduDescription?: string }]) => {
                  descriptions[key] = value.description;
                });
              } else if (category === 'islamicProphets') {
                descriptions = PROPHETS_DESCRIPTIONS;
              } else if (category === 'islamicMonths') {
                descriptions = ISLAMIC_MONTHS_DESCRIPTIONS;
              } else if (category === 'muslimScientists') {
                descriptions = MUSLIM_SCIENTISTS_DESCRIPTIONS;
              } else if (category === 'quranicSurahs') {
                descriptions = QURANIC_SURAHS_DESCRIPTIONS;
              } else if (category === 'islamicValues') {
                descriptions = ISLAMIC_VALUES_DESCRIPTIONS;
              }
              
              // Determine which WordList to render based on screen size
              const isMobileLayout = !breakpoints.isDesktop;
              
              return (
                <>
                  {/* Conditionally render either desktop or mobile WordList */}
                  {isMobileLayout ? (
                    <div style={{
                      width: '100%',
                      marginTop: layoutConfig.spacing.marginTop,
                      marginBottom: layoutConfig.spacing.marginBottom
                    }}>
                      <WordList
                        words={gameState.words}
                        theme={currentTheme}
                        showDescriptions={gameState.settings.showDescriptions}
                        kidsMode={gameState.settings.kidsMode}
                        isMobileLayout={true}
                        descriptions={descriptions}
                        selectedWord={selectedDescriptionWord}
                        setSelectedWord={setSelectedDescriptionWord}
                      />
                    </div>
                  ) : (
                    <WordList
                      words={gameState.words}
                      theme={currentTheme}
                      showDescriptions={gameState.settings.showDescriptions}
                      kidsMode={gameState.settings.kidsMode}
                      isMobileLayout={false}
                      descriptions={descriptions}
                      selectedWord={selectedDescriptionWord}
                      setSelectedWord={setSelectedDescriptionWord}
                    />
                  )}
                </>
              );
            }, [breakpoints.isDesktop, currentTheme, gameState.settings.kidsMode, gameState.settings.showDescriptions, gameState.settings.wordCategory, gameState.words, layoutConfig.spacing.marginBottom, layoutConfig.spacing.marginTop])}

            {/* Game Controls */}
            <div
              style={{
                padding: breakpoints.isTablet || breakpoints.isDesktop ? '16px' : '12px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexWrap: breakpoints.width >= 480 ? 'nowrap' : 'wrap',
                alignItems: 'center',
                justifyContent: breakpoints.width >= 480 ? 'space-between' : 'center',
                gap: '10px',
                backgroundColor: currentTheme.gridBg
              }}
            >
              {/* Hint System */}
              <HintSystem
                words={gameState.words}
                onHintUsed={handleHintUsed}
                theme={currentTheme}
                hintsRemaining={hintsRemaining}
              />

              {/* Timer Display (for countdown mode) */}
              {gameState.settings.timerMode === 'countdown' && timeRemaining !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: timeRemaining < 30 ? 'rgba(239, 68, 68, 0.2)' : currentTheme.cellBg,
                  color: timeRemaining < 30 ? '#ef4444' : currentTheme.primary,
                  border: timeRemaining < 30 ? '1px solid #ef4444' : `1px solid ${currentTheme.secondary}40`,
                  animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
                }}>
                  <Clock size={20} style={{
                    color: timeRemaining < 30 ? '#ef4444' : currentTheme.secondary
                  }} />
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Achievement System */}
              <AchievementSystem
                theme={currentTheme}
              />

              {/* Kids Achievements System */}
              {gameState.settings.kidsMode && (
                <KidsAchievements
                  theme={currentTheme}
                  foundWords={Array.from(gameState.foundWords)}
                  kidsMode={gameState.settings.kidsMode}
                />
              )}

              {/* Leaderboard System */}
              <LeaderboardSystem
                theme={currentTheme}
              />

              {/* Level System */}
              <LevelSystem
                theme={currentTheme}
                onStartLevel={(currentLevel, settings) => {
                  // Update settings with level-specific words
                  const levelSettings = {
                    ...settings,
                    // Set categories based on current word category
                    wordCategory: gameState.settings.wordCategory,
                    // Keep user preferences
                    theme: gameState.settings.theme,
                    showDescriptions: gameState.settings.showDescriptions,
                    timerMode: gameState.settings.timerMode,
                    timerDuration: gameState.settings.timerDuration
                  };

                  // Log the current level (using the parameter to avoid the warning)
                  console.log(`Starting level ${currentLevel}`);

                  // Initialize game with the level settings
                  initializeGame(levelSettings);
                }}
                currentSettings={gameState.settings}
              />

              {/* Info Button */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  border: `1px solid ${currentTheme.secondary}40`,
                  backgroundColor: currentTheme.cellBg,
                  color: currentTheme.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Info size={20} />
              </button>
            </div>

            {/* Game Info Panel */}
            {showInfo && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: currentTheme.gridBg
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: currentTheme.primary
                }}>
                  How to Play
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  color: currentTheme.primary,
                  fontSize: '14px'
                }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Find all words hidden in the grid</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Click and drag to select letters</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Words can be horizontal, vertical, or diagonal</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Use hints if you get stuck (limited per game)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Game Complete Celebration */}
        {gameState.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="text-center animate-float p-8 rounded-xl shadow-2xl"
              style={{
                backgroundColor: `${currentTheme.gridBg}CC`,
                backdropFilter: 'blur(8px)',
                border: `2px solid ${currentTheme.accent}40`
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
                  fontFamily: currentTheme.font
                }}
              >
                Congratulations!
              </div>
              <div className="text-xl opacity-90 mb-2" style={{ color: currentTheme.primary }}>
                All words found in {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')}
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
                    backgroundColor: currentTheme.cellBg,
                    boxShadow: `0 0 20px ${currentTheme.accent}40`
                  }}
                >
                  <Trophy className="animate-pulse" style={{ color: currentTheme.accent }} />
                  <span style={{ color: currentTheme.primary, fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {gameState.score.toLocaleString()} points
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-6 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 pointer-events-auto"
                style={{
                  backgroundColor: currentTheme.secondary,
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
                  style={{ color: currentTheme.accent }}
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
                border: '2px solid #ef4444',
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
                    backgroundColor: currentTheme.secondary,
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
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
                    border: `1px solid ${currentTheme.secondary}`,
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
