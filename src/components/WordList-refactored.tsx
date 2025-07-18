import { useState, useMemo, useCallback } from 'react';
import type { WordPlacement } from '../types/game';
import { FIVE_PILLARS_DESCRIPTIONS } from '../types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from '../types/islamicPlacesDescriptions';
import { shouldUseKidsDescription, getKidsDescription } from '../types/kidsMode';
import { AudioPronunciation } from './AudioPronunciation';
import { VisualIllustration } from './VisualIllustration';
import { WordListItem } from './WordListItem';
import { WordListProgress } from './WordListProgress';
import { WordListCompletion } from './WordListCompletion';
import { BookOpen, MapPin, Globe, Sparkles } from 'lucide-react';

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

// Memoized Description Box Component
const DescriptionBox: React.FC<DescriptionBoxProps> = ({ word, color, onClose, kidsMode = false, theme }) => {
    const descriptionData = useMemo(() => {
        if (kidsMode && shouldUseKidsDescription(word, kidsMode)) {
            return {
                description: getKidsDescription(word),
                descriptionType: 'kidsMode' as const,
                urduDescription: undefined
            };
        }

        const description = FIVE_PILLARS_DESCRIPTIONS[word] ||
            (ISLAMIC_PLACES_DESCRIPTIONS[word]?.description || '');
        const urduDescription = ISLAMIC_PLACES_DESCRIPTIONS[word]?.urduDescription;
        const descriptionType = FIVE_PILLARS_DESCRIPTIONS[word] ? 'fivePillars' as const : 'islamicPlaces' as const;

        return { description, descriptionType, urduDescription };
    }, [word, kidsMode]);

    const isMobile = window.innerWidth < 480;

    const getIcon = () => {
        switch (descriptionData.descriptionType) {
            case 'islamicPlaces':
                return <MapPin size={24} style={{ color, marginRight: '8px' }} />;
            case 'kidsMode':
                return <BookOpen size={24} style={{ color, marginRight: '8px' }} />;
            default:
                return <BookOpen size={24} style={{ color, marginRight: '8px' }} />;
        }
    };

    const getTypeLabel = () => {
        switch (descriptionData.descriptionType) {
            case 'islamicPlaces':
                return 'Sacred Place in Islam';
            case 'kidsMode':
                return 'Islamic Term for Kids';
            default:
                return 'One of the Five Pillars of Islam';
        }
    };

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
                padding: isMobile ? '16px' : '20px',
                maxWidth: '90%',
                width: isMobile ? '95%' : '400px',
                boxShadow: `0 0 30px ${color}80, 0 0 10px rgba(0, 0, 0, 0.3)`,
                border: `2px solid ${color}`,
                animation: 'bounce-in 0.6s ease-out forwards',
                textAlign: 'center',
                position: 'relative',
                maxHeight: isMobile ? '90vh' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                }}>
                    {getIcon()}
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color
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
                    marginBottom: descriptionData.urduDescription ? '8px' : '12px',
                    textAlign: 'left'
                }}>
                    {descriptionData.description}
                </div>

                {/* Urdu description (only for Islamic Places) */}
                {descriptionData.urduDescription && (
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
                        {descriptionData.urduDescription}
                    </div>
                )}

                {/* Visual illustration for Kids Mode */}
                {kidsMode && descriptionData.descriptionType === 'kidsMode' && (
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
                    {getTypeLabel()}
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
                        fontSize: isMobile ? '24px' : '20px',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '50%',
                        width: isMobile ? '44px' : '30px',
                        height: isMobile ? '44px' : '30px',
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
                    color,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                }}>
                    {descriptionData.descriptionType === 'islamicPlaces' ? (
                        <Globe size={24} />
                    ) : (
                        <Sparkles size={24} />
                    )}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '-10px',
                    color,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                    animationDelay: '0.5s'
                }}>
                    {descriptionData.descriptionType === 'islamicPlaces' ? (
                        <MapPin size={24} />
                    ) : (
                        <Sparkles size={24} />
                    )}
                </div>
            </div>
        </div>
    );
};

export const WordList: React.FC<WordListProps> = ({
    words,
    theme,
    showDescriptions = true,
    kidsMode = false,
    isMobileLayout = false
}) => {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    // Memoize expensive calculations
    const { foundCount, totalCount, completionPercentage } = useMemo(() => {
        const foundCount = words.filter(w => w.found).length;
        const totalCount = words.length;
        const completionPercentage = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

        return { foundCount, totalCount, completionPercentage };
    }, [words]);

    // Stable function references to prevent unnecessary re-renders
    const hasDescription = useCallback((word: string): boolean => {
        return Boolean(FIVE_PILLARS_DESCRIPTIONS[word] || ISLAMIC_PLACES_DESCRIPTIONS[word]);
    }, []); // Empty dependency array since the dictionaries are static

    const handleWordClick = useCallback((word: string) => {
        setSelectedWord(word);
    }, []); // setSelectedWord is stable from useState

    const containerStyle = {
        padding: isMobileLayout ? '12px' : '24px',
        borderRadius: '12px',
        boxShadow: isMobileLayout
            ? '0 10px 25px -12px rgba(0, 0, 0, 0.25)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: isMobileLayout ? '100%' : 'auto',
        minWidth: isMobileLayout ? 'auto' : '256px',
        boxSizing: 'border-box' as const,
        backgroundColor: theme.gridBg,
        marginBottom: isMobileLayout ? '8px' : '0'
    };

    const wordListStyle = isMobileLayout ? {
        display: 'flex',
        flexDirection: 'row' as const,
        gap: '8px',
        overflowX: 'auto' as const,
        overflowY: 'hidden' as const,
        padding: '4px 0',
        WebkitOverflowScrolling: 'touch' as const,
        scrollbarWidth: 'none' as const,
        msOverflowStyle: 'none' as const
    } : {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        maxHeight: '384px',
        overflowY: 'auto' as const
    };

    return (
        <div style={containerStyle}>
            <WordListProgress
                foundCount={foundCount}
                totalCount={totalCount}
                completionPercentage={completionPercentage}
                theme={theme}
                isMobile={isMobileLayout}
            />

            <div style={wordListStyle}>
                {words.map((word, index) => (
                    <WordListItem
                        key={`${word.word}-${index}`}
                        word={word}
                        index={index}
                        isFound={word.found}
                        theme={theme}
                        showDescriptions={showDescriptions}
                        hasDescription={hasDescription}
                        onWordClick={handleWordClick}
                        isMobile={isMobileLayout}
                    />
                ))}
            </div>

            <WordListCompletion
                foundCount={foundCount}
                totalCount={totalCount}
            />

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