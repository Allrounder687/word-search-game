import React, { useEffect } from 'react';
import { BookOpen, MapPin, Globe, Sparkles, X } from 'lucide-react';
import type { ThemeColors } from '../types/game';
import { FIVE_PILLARS_DESCRIPTIONS } from '../types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from '../types/islamicPlacesDescriptions';
import { shouldUseKidsDescription, getKidsDescription } from '../types/kidsMode';
import { AudioPronunciation } from './AudioPronunciation';
import { VisualIllustration } from './VisualIllustration';

interface DescriptionBoxProps {
  word: string;
  color: string;
  onClose: () => void;
  kidsMode?: boolean;
  theme?: ThemeColors;
  descriptions?: Record<string, string>;
}

export const DescriptionBox: React.FC<DescriptionBoxProps> = ({ 
  word, 
  color, 
  onClose, 
  kidsMode = false, 
  theme, 
  descriptions 
}) => {
  // Check if we should use kids mode description
  let description;
  let descriptionType;
  let urduDescription;
  
  if (kidsMode && shouldUseKidsDescription(word, kidsMode)) {
    // Use simplified description for kids
    description = getKidsDescription(word);
    descriptionType = 'kidsMode';
  } else if (descriptions) {
    // Use provided descriptions mapping
    description = descriptions[word] || '';
    descriptionType = 'category';
  } else {
    // Fallback to previous hardcoded logic
    description = FIVE_PILLARS_DESCRIPTIONS[word] || 
      (ISLAMIC_PLACES_DESCRIPTIONS[word]?.description || '');
    urduDescription = ISLAMIC_PLACES_DESCRIPTIONS[word]?.urduDescription;
    descriptionType = FIVE_PILLARS_DESCRIPTIONS[word] ? 'fivePillars' : 'islamicPlaces';
  }
  
  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="description-title"
      style={{
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
      }}
    >
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
          <div id="description-title" style={{ 
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
            : FIVE_PILLARS_DESCRIPTIONS[word] 
            ? 'Five Pillars of Islam'
            : ISLAMIC_PLACES_DESCRIPTIONS[word] 
            ? 'Sacred Place in Islam'
            : descriptions && descriptions[word] 
            ? descriptions[word].split(':')[0] || 'Custom Category'
            : 'Islamic Term'}
        </div>
        
        {/* Close button - optimized for touch */}
        <button
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
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
          aria-label="Close description"
          tabIndex={0}
        >
          <X size={window.innerWidth < 480 ? 24 : 20} />
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