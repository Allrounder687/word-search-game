import { useState, useEffect } from 'react';
import { RotateCcw, Lock, Unlock } from 'lucide-react';
import { lockScreenOrientation } from '../utils/responsiveLayout';

interface OrientationWarningProps {
  theme: any;
}

export const OrientationWarning: React.FC<OrientationWarningProps> = ({ theme }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);
  
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only show on phones, not tablets
  const isPhone = isMobile && window.innerWidth < 768;
  
  // Check if orientation lock is supported
  const isOrientationLockSupported = 
    (screen.orientation && typeof (screen.orientation as any).lock === 'function') || 
    (typeof (screen as any).msLockOrientation === 'function') || 
    (typeof (screen as any).mozLockOrientation === 'function');
  
  useEffect(() => {
    // Only run this on mobile phones
    if (!isPhone) return;
    
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      
      // Only show warning if not in portrait mode and not locked
      if (!isPortraitMode && !orientationLocked) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
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
  }, [isPhone, orientationLocked]);
  
  const handleLockOrientation = () => {
    try {
      // Lock to portrait orientation
      lockScreenOrientation('portrait');
      setOrientationLocked(true);
      setShowWarning(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Orientation locked to portrait';
      successMessage.style.position = 'fixed';
      successMessage.style.bottom = '20px';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translateX(-50%)';
      successMessage.style.backgroundColor = theme.secondary;
      successMessage.style.color = 'white';
      successMessage.style.padding = '10px 20px';
      successMessage.style.borderRadius = '8px';
      successMessage.style.zIndex = '1000';
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (e) {
      console.error('Failed to lock orientation:', e);
      setOrientationLocked(false);
    }
  };
  
  const handleUnlockOrientation = () => {
    try {
      // Unlock orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      } else if (screen.msUnlockOrientation) {
        screen.msUnlockOrientation();
      } else if (screen.mozUnlockOrientation) {
        screen.mozUnlockOrientation();
      }
      setOrientationLocked(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Orientation unlocked';
      successMessage.style.position = 'fixed';
      successMessage.style.bottom = '20px';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translateX(-50%)';
      successMessage.style.backgroundColor = theme.secondary;
      successMessage.style.color = 'white';
      successMessage.style.padding = '10px 20px';
      successMessage.style.borderRadius = '8px';
      successMessage.style.zIndex = '1000';
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (e) {
      console.error('Failed to unlock orientation:', e);
    }
  };
  
  // Floating orientation lock button for mobile
  const OrientationLockButton = () => {
    if (!isPhone || !isOrientationLockSupported) return null;
    
    return (
      <button
        onClick={orientationLocked ? handleUnlockOrientation : handleLockOrientation}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: theme.secondary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          cursor: 'pointer'
        }}
        title={orientationLocked ? "Unlock orientation" : "Lock to portrait"}
      >
        {orientationLocked ? <Unlock size={24} /> : <Lock size={24} />}
      </button>
    );
  };
  
  if (!showWarning && !orientationLocked) {
    return <OrientationLockButton />;
  }
  
  if (!showWarning || !isPhone) return <OrientationLockButton />;
  
  return (
    <>
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
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '300px'
        }}>
          {isOrientationLockSupported && (
            <button
              onClick={handleLockOrientation}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: theme.secondary,
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={20} />
              Lock to Portrait Mode
            </button>
          )}
          
          <button
            onClick={() => setShowWarning(false)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: isOrientationLockSupported ? 'rgba(255, 255, 255, 0.2)' : theme.secondary,
              color: 'white',
              fontWeight: isOrientationLockSupported ? 'normal' : 'bold',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
      
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
    </>
  );
};