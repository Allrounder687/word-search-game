import { useState, useMemo, useEffect, useRef } from 'react';
import type { WordPlacement, ThemeColors } from '../types/game';
import { Search, Sparkles } from 'lucide-react';
import { FIVE_PILLARS_DESCRIPTIONS, PROPHETS_DESCRIPTIONS, ISLAMIC_MONTHS_DESCRIPTIONS, MUSLIM_SCIENTISTS_DESCRIPTIONS, ISLAMIC_LANDMARKS_DESCRIPTIONS, QURANIC_SURAHS_DESCRIPTIONS, ISLAMIC_VALUES_DESCRIPTIONS } from '../types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from '../types/islamicPlacesDescriptions';
import { WordListItem } from './WordListItem';
import { DescriptionBox } from './DescriptionBox';

interface WordListProps {
  words: WordPlacement[];
  theme: ThemeColors;
  showDescriptions?: boolean;
  kidsMode?: boolean;
  isMobileLayout?: boolean;
  descriptions?: Record<string, string>;
  selectedWord?: string | null;
  setSelectedWord?: (word: string | null) => void;
}

export const WordList: React.FC<WordListProps> = ({ 
  words, 
  theme, 
  showDescriptions = true, 
  kidsMode = false, 
  isMobileLayout = false, 
  descriptions,
  selectedWord: externalSelectedWord,
  setSelectedWord: externalSetSelectedWord
}) => {
  // Use internal state if external state is not provided
  const [internalSelectedWord, setInternalSelectedWord] = useState<string | null>(null);
  
  // Use either external or internal state
  const selectedWord = externalSelectedWord !== undefined ? externalSelectedWord : internalSelectedWord;
  const setSelectedWord = externalSetSelectedWord || setInternalSelectedWord;
  
  const prevWordsRef = useRef<WordPlacement[]>([]);
  const isInitialMount = useRef(true);
  const isAutoShowingRef = useRef(false); // Track if description is being shown automatically
  
  // Combine all description sources
  const allDescriptions = useMemo(() => ({
    ...FIVE_PILLARS_DESCRIPTIONS,
    ...PROPHETS_DESCRIPTIONS,
    ...ISLAMIC_MONTHS_DESCRIPTIONS,
    ...MUSLIM_SCIENTISTS_DESCRIPTIONS,
    ...ISLAMIC_LANDMARKS_DESCRIPTIONS,
    ...QURANIC_SURAHS_DESCRIPTIONS,
    ...ISLAMIC_VALUES_DESCRIPTIONS,
    ...ISLAMIC_PLACES_DESCRIPTIONS,
    ...(descriptions || {})
  }), [descriptions]);

  // Effect to show description when a new word is found
  useEffect(() => {
    // Skip the initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevWordsRef.current = [...words];
      return;
    }

    // Find newly found words by comparing with previous words
    const newlyFoundWord = words.find(w => (
      w.found && 
      !prevWordsRef.current.some(pw => pw.word === w.word && pw.found) &&
      allDescriptions[w.word] !== undefined
    ));
    
    // Update the state for the next render
    let timeoutId: number;
    if (newlyFoundWord && !isAutoShowingRef.current) {
      isAutoShowingRef.current = true; // Set flag to prevent duplicate showing
      setSelectedWord(newlyFoundWord.word);
      
      // Auto-close description after 5 seconds
      timeoutId = window.setTimeout(() => {
        setSelectedWord(null);
        isAutoShowingRef.current = false; // Reset flag after closing
      }, 5000);
    }
    
    // Always update the ref with current words for next comparison
    prevWordsRef.current = [...words];
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [words, allDescriptions]);
  
  // Memoize expensive calculations
  const { foundCount, totalCount, hasDescription } = useMemo(() => {
    const foundCount = words.filter(w => w.found).length;
    const totalCount = words.length;
    const hasDescription = (word: string) => {
      return allDescriptions[word] !== undefined;
    };
    
    return { foundCount, totalCount, hasDescription };
  }, [words, allDescriptions]);

  // Memoize completion percentage
  const completionPercentage = useMemo(() => {
    return totalCount > 0 ? (foundCount / totalCount) * 100 : 0;
  }, [foundCount, totalCount]);

  // Optimize for mobile layout at the top of the screen
  if (isMobileLayout) {
    return (
      <div
        style={{ 
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.15)',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: `${theme.gridBg}90`,
          backdropFilter: 'blur(8px)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: `${theme.accent}20`
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px'
          }}>
            <Search size={14} style={{ color: theme.secondary }} />
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              margin: 0,
              color: theme.primary 
            }}>
              {foundCount}/{totalCount}
            </h3>
          </div>
          
          {/* Compact progress bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            flexGrow: 1,
            marginLeft: '8px',
            maxWidth: '100px'
          }}>
            <div
              style={{ 
                flexGrow: 1, 
                height: '4px', 
                borderRadius: '2px', 
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }}
            >
              <div
                className="animate-rainbow"
                style={{
                  height: '100%',
                  width: `${completionPercentage}%`,
                  transition: 'all 0.5s ease-out'
                }}
              />
            </div>
            <span style={{
              fontSize: '12px',
              color: theme.primary,
              opacity: 0.8
            }}>
              {Math.round(completionPercentage)}%
            </span>
          </div>
        </div>

        {/* Horizontal scrolling word list for mobile */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '2px 0',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {words.map((word, index) => (
            <WordListItem
              key={`${word.word}-${index}`}
              word={word}
              index={index}
              theme={theme}
              showDescriptions={showDescriptions}
              hasDescription={hasDescription}
              onSelectWord={(word) => {
                // Only set selected word if not already showing automatically
                if (!isAutoShowingRef.current) {
                  setSelectedWord(word);
                }
              }}
              isMobileLayout={true}
            />
          ))}
        </div>

        {foundCount === totalCount && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            borderRadius: '8px', 
            textAlign: 'center',
            background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
            backgroundSize: '400% 400%',
            animation: 'rainbow-shift 3s ease infinite'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              🎉 Congratulations! 🎉
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              All words found!
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <Sparkles 
                size={20} 
                style={{ animation: 'float 3s ease-in-out infinite' }} 
              />
            </div>
          </div>
        )}
        
        {/* Render the description box when a word is selected - only in mobile layout */}
        {selectedWord && isMobileLayout && (
          <DescriptionBox
            word={selectedWord}
            color={words.find(w => w.word === selectedWord)?.color || theme.secondary}
            onClose={() => {
              setSelectedWord(null);
              isAutoShowingRef.current = false; // Reset flag when manually closed
            }}
            kidsMode={kidsMode}
            theme={theme}
            descriptions={descriptions}
          />
        )}
      </div>
    );
  }

  // Desktop layout (standard vertical list)
  return (
    <div
      style={{ 
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        minWidth: '256px',
        width: 'auto',
        boxSizing: 'border-box',
        backgroundColor: theme.gridBg 
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px' 
      }}>
        <Search size={20} style={{ color: theme.secondary }} />
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: 0,
          color: theme.primary 
        }}>
          Words to Find
        </h3>
      </div>

      <div style={{ 
        marginBottom: '16px', 
        padding: '12px', 
        borderRadius: '8px', 
        backgroundColor: theme.cellBg 
      }}>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.75, 
          marginBottom: '4px',
          color: theme.primary 
        }}>
          Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{ 
              flexGrow: 1, 
              height: '8px', 
              borderRadius: '4px', 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <div
              className="animate-rainbow"
              style={{
                height: '100%',
                width: `${(foundCount / totalCount) * 100}%`,
                transition: 'all 0.5s ease-out'
              }}
            />
          </div>
          <span style={{ 
            fontSize: '14px', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontWeight: '600',
            color: theme.primary 
          }}>
            {foundCount}/{totalCount}
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        maxHeight: '384px', 
        overflowY: 'auto' 
      }}>
        {words.map((word, index) => (
          <WordListItem
            key={`${word.word}-${index}`}
            word={word}
            index={index}
            theme={theme}
            showDescriptions={showDescriptions}
            hasDescription={hasDescription}
            onSelectWord={(word) => {
              // Only set selected word if not already showing automatically
              if (!isAutoShowingRef.current) {
                setSelectedWord(word);
              }
            }}
            isMobileLayout={false}
          />
        ))}
      </div>

      {foundCount === totalCount && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          borderRadius: '8px', 
          textAlign: 'center',
          background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
          backgroundSize: '400% 400%',
          animation: 'rainbow-shift 3s ease infinite'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            🎉 Congratulations! 🎉
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            All words found!
          </div>
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
            <Sparkles 
              size={20} 
              style={{ animation: 'float 3s ease-in-out infinite' }} 
            />
          </div>
        </div>
      )}
      
      {/* Render the description box when a word is selected - only in desktop layout */}
      {selectedWord && !isMobileLayout && (
        <DescriptionBox
          word={selectedWord}
          color={words.find(w => w.word === selectedWord)?.color || theme.secondary}
          onClose={() => {
            setSelectedWord(null);
            isAutoShowingRef.current = false; // Reset flag when manually closed
          }}
          kidsMode={kidsMode}
          theme={theme}
          descriptions={descriptions}
        />
      )}
    </div>
  );
};