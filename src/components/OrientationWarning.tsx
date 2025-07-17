import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface OrientationWarningProps {
  theme: any;
}

export const OrientationWarning: React.FC<OrientationWarningProps> = ({ theme }) => {
  // We track portrait state even though we don't directly use the variable
  // because we need to update it with setIsPortrait for the component to work correctly
  const [, setIsPortrait] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only show on phones, not tablets
  const isPhone = isMobile && window.innerWidth < 768;
  
  useEffect(() => {
    // Only run this on mobile phones
    if (!isPhone) return;
    
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
      setShowWarning(!isPortraitMode);
    };
    
    // Check orientation on mount
    checkOrientation();
    
    // Add event listener for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isPhone]);
  
  if (!showWarning || !isPhone) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      textAlign: 'center'
    }}>
      <RotateCcw 
        size={64} 
        style={{ 
          color: theme.secondary,
          marginBottom: '20px',
          animation: 'rotate-animation 2s ease-in-out infinite'
        }} 
      />
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: '16px'
      }}>
        Please Rotate Your Device
      </h2>
      
      <p style={{
        fontSize: '16px',
        color: theme.primary,
        marginBottom: '24px',
        maxWidth: '300px',
        lineHeight: 1.5
      }}>
        This game works best in portrait mode. Please rotate your device for the best experience.
      </p>
      
      <button
        onClick={() => setShowWarning(false)}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: theme.secondary,
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Continue Anyway
      </button>
      
      <style>
        {`
          @keyframes rotate-animation {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-90deg); }
            75% { transform: rotate(-90deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
};