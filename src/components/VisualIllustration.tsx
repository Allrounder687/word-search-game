import { Image } from 'lucide-react';
import { getIllustration } from '../types/kidsMode';

interface VisualIllustrationProps {
  word: string;
  kidsMode: boolean;
  theme: any;
}

export const VisualIllustration: React.FC<VisualIllustrationProps> = ({ word, kidsMode, theme }) => {
  // Don't render if kids mode is disabled or no illustration exists
  if (!kidsMode || !getIllustration(word)) return null;
  
  // In a real implementation, this would show the actual illustration
  // For now, we'll just show a placeholder
  
  // Determine if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 480;
  
  return (
    <div style={{
      marginTop: '12px',
      padding: isSmallScreen ? '12px' : '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: isSmallScreen ? '100px' : '120px',
        height: isSmallScreen ? '100px' : '120px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px dashed ${theme.secondary}80`,
        boxShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none'
      }}>
        <Image 
          size={isSmallScreen ? 36 : 48} 
          style={{ 
            color: theme.secondary, 
            opacity: 0.7,
            animation: 'pulse-glow 2s ease-in-out infinite'
          }} 
        />
      </div>
      
      <div style={{
        fontSize: isSmallScreen ? '11px' : '12px',
        color: theme.primary,
        opacity: 0.8,
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Visual illustration for {word}
      </div>
    </div>
  );
};