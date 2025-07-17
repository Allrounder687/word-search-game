import { useState, useMemo } from 'react';
import type { WordPlacement } from '../types/game';
import { Check, Search, Star, Sparkles, Info, BookOpen, MapPin, Globe } from 'lucide-react';
import { FIVE_PILLARS_DESCRIPTIONS } from '../types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from '../types/islamicPlacesDescriptions';
import { shouldUseKidsDescription, getKidsDescription } from '../types/kidsMode';
import { AudioPronunciation } from './AudioPronunciation';
import { VisualIllustration } from './VisualIllustration';

interface WordListProps {
    words: WordPlacement[];
    theme: any;
    showDescriptions?: boolean;
    kidsMode?: boolean;
    isMobileLayout?: boolean;
}

interface DescriptionBoxProps {
    word: string;
    color: string;
    onClose: () => void;
    kidsMode?: boolean;
    theme?: any;
}

// Description Box Component
const DescriptionBox: React.FC<DescriptionBoxProps> = ({ word, color, onClose, kidsMode = false, theme }) => {
    // Check if we should use kids mode description
    let description;
    let descriptionType;
    let urduDescription;
    
    if (kidsMode && shouldUseKidsDescription(word, kidsMode)) {
        // Use simplified description for kids
        description = getKidsDescription(word);
        descriptionType = 'kidsMode';
    } else {
        // Use standard descriptions
        description = FIVE_PILLARS_DESCRIPTIONS[word] || 
            (ISLAMIC_PLACES_DESCRIPTIONS[word]?.description || '');
        
        // Get the Urdu description if it's an Islamic place
        urduDescription = ISLAMIC_PLACES_DESCRIPTIONS[word]?.urduDescription;
        
        // Determine the description type
        descriptionType = FIVE_PILLARS_DESCRIPTIONS[word] ? 'fivePillars' : 'islamicPlaces';
    }
    
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: window.innerWidth < 480 ? '16px' : '20px',
                maxWidth: '90%',
                width: window.innerWidth < 480 ? '95%' : '400px',
                boxShadow: `0 0 30px ${color}80, 0 0 10px rgba(0, 0, 0, 0.3)`,
                border: `2px solid ${color}`,
                animation: 'bounce-in 0.6s ease-out forwards',
                textAlign: 'center',
                position: 'relative',
                maxHeight: window.innerWidth < 480 ? '90vh' : 'auto',
                overflowY: window.innerWidth < 480 ? 'auto' : 'visible'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                }}>
                    {descriptionType === 'islamicPlaces' ? (
                        <MapPin 
                            size={24} 
                            style={{ 
                                color: color,
                                marginRight: '8px'
                            }} 
                        />
                    ) : descriptionType === 'kidsMode' ? (
                        <BookOpen 
                            size={24} 
                            style={{ 
                                color: color,
                                marginRight: '8px'
                            }} 
                        />
                    ) : (
                        <BookOpen 
                            size={24} 
                            style={{ 
                                color: color,
                                marginRight: '8px'
                            }} 
                        />
                    )}
                    <div style={{ 
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: color
                    }}>
                        {word}
                    </div>
                    
                    {/* Audio pronunciation for Kids Mode */}
                    {kidsMode && (
                        <div style={{ marginLeft: '8px' }}>
                            <AudioPronunciation 
                                word={word} 
                                color={color} 
                                kidsMode={kidsMode} 
                            />
                        </div>
                    )}
                </div>
                
                {/* English description */}
                <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    marginBottom: urduDescription ? '8px' : '12px',
                    textAlign: 'left'
                }}>
                    {description}
                </div>
                
                {/* Urdu description (only for Islamic Places) */}
                {urduDescription && (
                    <div style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        lineHeight: '1.5',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        direction: 'rtl',
                        fontFamily: "'Noto Nastaliq Urdu', serif",
                        textAlign: 'right'
                    }}>
                        {urduDescription}
                    </div>
                )}
                
                {/* Visual illustration for Kids Mode */}
                {kidsMode && descriptionType === 'kidsMode' && (
                    <VisualIllustration 
                        word={word} 
                        kidsMode={kidsMode} 
                        theme={theme} 
                    />
                )}
                
                <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontStyle: 'italic',
                    marginTop: '12px'
                }}>
                    {descriptionType === 'islamicPlaces' 
                        ? 'Sacred Place in Islam' 
                        : descriptionType === 'kidsMode'
                        ? 'Islamic Term for Kids'
                        : 'One of the Five Pillars of Islam'}
                </div>
                
                {/* Close button - optimized for touch */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        fontSize: window.innerWidth < 480 ? '24px' : '20px',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '50%',
                        width: window.innerWidth < 480 ? '44px' : '30px',
                        height: window.innerWidth < 480 ? '44px' : '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                        touchAction: 'manipulation'
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
                
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    color: color,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                }}>
                    {descriptionType === 'islamicPlaces' ? (
                        <Globe size={24} />
                    ) : (
                        <Sparkles size={24} />
                    )}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '-10px',
                    color: color,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                    animationDelay: '0.5s'
                }}>
                    {descriptionType === 'islamicPlaces' ? (
                        <MapPin size={24} />
                    ) : (
                        <Sparkles size={24} />
                    )}
                </div>
            </div>
        </div>
    );
};

export const WordList: React.FC<WordListProps> = ({ words, theme, showDescriptions = true, kidsMode = false, isMobileLayout = false }) => {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    
    // Memoize expensive calculations
    const { foundCount, totalCount, hasDescription } = useMemo(() => {
        const foundCount = words.filter(w => w.found).length;
        const totalCount = words.length;
        const hasDescription = (word: string) => {
            return FIVE_PILLARS_DESCRIPTIONS[word] || ISLAMIC_PLACES_DESCRIPTIONS[word];
        };
        
        return { foundCount, totalCount, hasDescription };
    }, [words]);

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
                    border: `1px solid ${theme.accent}20`
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
                {words.map((word, index) => {
                    const isFound = word.found;
                    return (
                        <div
                            key={`${word.word}-${index}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                backgroundColor: isFound ? word.color + '20' : theme.cellBg,
                                borderBottom: isFound ? `2px solid ${word.color}` : '2px solid transparent',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isFound ? `0 0 10px rgba(255, 255, 255, 0.3)` : 'none',
                                minHeight: '36px',
                                minWidth: 'fit-content',
                                flexShrink: 0,
                                touchAction: 'manipulation' // Improve touch handling
                            }}
                            onMouseEnter={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                            onTouchStart={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onTouchEnd={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {/* Animated background for found words */}
                            {isFound && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0.2,
                                        background: `linear-gradient(90deg, transparent, ${word.color}60, transparent)`,
                                        backgroundSize: '200% 100%',
                                        animation: 'word-trail 2s ease-in-out infinite'
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s',
                                    backgroundColor: isFound ? word.color : 'rgba(255, 255, 255, 0.1)',
                                    color: isFound ? '#ffffff' : theme.primary,
                                    zIndex: 1,
                                    animation: isFound ? 'word-found 0.6s ease-out' : 'none'
                                }}
                            >
                                {isFound ? (
                                    <Check size={14} style={{ animation: 'bounce 1s infinite' }} />
                                ) : (
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{index + 1}</span>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                zIndex: 1
                            }}>
                                <span
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontWeight: '500',
                                        transition: 'all 0.3s',
                                        textDecoration: isFound ? 'line-through' : 'none',
                                        color: isFound ? word.color : theme.primary,
                                        textShadow: isFound ? `0 0 10px ${word.color}40` : 'none'
                                    }}
                                >
                                    {word.word}
                                </span>
                                
                                {/* Info icon for words with descriptions */}
                                {showDescriptions && hasDescription(word.word) && (
                                    <div 
                                        title={isFound ? "Click to view description" : "Find this word to unlock its description"}
                                        onClick={() => {
                                            // Only show description if the word is found
                                            if (isFound) {
                                                setSelectedWord(word.word);
                                            }
                                        }}
                                        style={{
                                            cursor: isFound ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        <Info 
                                            size={14} 
                                            style={{ 
                                                color: isFound ? word.color : 'rgba(255, 255, 255, 0.4)',
                                                opacity: isFound ? 1 : 0.5,
                                                transition: 'all 0.3s'
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {isFound && (
                                <div style={{ 
                                    marginLeft: 'auto', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    {Math.random() > 0.5 ? (
                                        <Star 
                                            size={14} 
                                            style={{ 
                                                color: word.color,
                                                animation: 'pulse-glow 2s ease-in-out infinite'
                                            }} 
                                        />
                                    ) : (
                                        <Sparkles 
                                            size={14} 
                                            style={{ 
                                                color: word.color,
                                                animation: 'pulse-glow 2s ease-in-out infinite'
                                            }} 
                                        />
                                    )}
                                    <div
                                        style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: word.color,
                                            animation: 'pulse-glow 2s ease-in-out infinite'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
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
            
            {/* Render the description box when a word is selected */}
            {selectedWord && (
                <DescriptionBox
                    word={selectedWord}
                    color={words.find(w => w.word === selectedWord)?.color || theme.secondary}
                    onClose={() => setSelectedWord(null)}
                    kidsMode={kidsMode}
                    theme={theme}
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
                {words.map((word, index) => {
                    const isFound = word.found;
                    return (
                        <div
                            key={`${word.word}-${index}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                backgroundColor: isFound ? word.color + '20' : theme.cellBg,
                                borderLeft: isFound ? `4px solid ${word.color}` : '4px solid transparent',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isFound ? `0 0 10px rgba(255, 255, 255, 0.3)` : 'none',
                                minHeight: '44px',
                                touchAction: 'manipulation'
                            }}
                            onMouseEnter={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isFound) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {/* Animated background for found words */}
                            {isFound && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0.2,
                                        background: `linear-gradient(90deg, transparent, ${word.color}60, transparent)`,
                                        backgroundSize: '200% 100%',
                                        animation: 'word-trail 2s ease-in-out infinite'
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s',
                                    backgroundColor: isFound ? word.color : 'rgba(255, 255, 255, 0.1)',
                                    color: isFound ? '#ffffff' : theme.primary,
                                    zIndex: 1,
                                    animation: isFound ? 'word-found 0.6s ease-out' : 'none'
                                }}
                            >
                                {isFound ? (
                                    <Check size={14} style={{ animation: 'bounce 1s infinite' }} />
                                ) : (
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{index + 1}</span>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                zIndex: 1
                            }}>
                                <span
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontWeight: '500',
                                        transition: 'all 0.3s',
                                        textDecoration: isFound ? 'line-through' : 'none',
                                        color: isFound ? word.color : theme.primary,
                                        textShadow: isFound ? `0 0 10px ${word.color}40` : 'none'
                                    }}
                                >
                                    {word.word}
                                </span>
                                
                                {/* Info icon for words with descriptions */}
                                {showDescriptions && hasDescription(word.word) && (
                                    <div 
                                        title={isFound ? "Click to view description" : "Find this word to unlock its description"}
                                        onClick={() => {
                                            // Only show description if the word is found
                                            if (isFound) {
                                                setSelectedWord(word.word);
                                            }
                                        }}
                                        style={{
                                            cursor: isFound ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        <Info 
                                            size={14} 
                                            style={{ 
                                                color: isFound ? word.color : 'rgba(255, 255, 255, 0.4)',
                                                opacity: isFound ? 1 : 0.5,
                                                transition: 'all 0.3s'
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {isFound && (
                                <div style={{ 
                                    marginLeft: 'auto', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    {Math.random() > 0.5 ? (
                                        <Star 
                                            size={14} 
                                            style={{ 
                                                color: word.color,
                                                animation: 'pulse-glow 2s ease-in-out infinite'
                                            }} 
                                        />
                                    ) : (
                                        <Sparkles 
                                            size={14} 
                                            style={{ 
                                                color: word.color,
                                                animation: 'pulse-glow 2s ease-in-out infinite'
                                            }} 
                                        />
                                    )}
                                    <div
                                        style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: word.color,
                                            animation: 'pulse-glow 2s ease-in-out infinite'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
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
            
            {/* Render the description box when a word is selected */}
            {selectedWord && (
                <DescriptionBox
                    word={selectedWord}
                    color={words.find(w => w.word === selectedWord)?.color || theme.secondary}
                    onClose={() => setSelectedWord(null)}
                    kidsMode={kidsMode}
                    theme={theme}
                />
            )}
        </div>
    );
};