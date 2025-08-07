import { useState, useEffect } from 'react';
import { RotateCcw, Lock, Unlock } from 'lucide-react';
import { 
  lockScreenOrientation, 
  unlockScreenOrientation, 
  checkOrientationLockSupport 
} from '../utils/responsiveLayout';

interface OrientationWarningProps {
  theme: any;
}

export const OrientationWarning: React.FC<OrientationWarningProps> = ({ }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);
  
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only show on phones, not tablets
  const isPhone = isMobile && window.innerWidth < 768;
  
  // Check if orientation lock is supported using the improved API
  const orientationSupport = checkOrientationLockSupport();
  const isOrientationLockSupported = orientationSupport.supported;
  
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
  
  // Helper function to show success messages
  const showSuccessMessage = (message: string) => {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;
    Object.assign(successMessage.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--secondary)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      zIndex: '1000',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.3s ease-out'
    });
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        successMessage.style.animation = 'slideDown 0.3s ease-in forwards';
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 300);
      }
    }, 3000);
  };

  // Helper function to show error messages
  const showErrorMessage = (message: string) => {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = message;
    Object.assign(errorMessage.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      zIndex: '1000',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.3s ease-out'
    });
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
      if (document.body.contains(errorMessage)) {
        errorMessage.style.animation = 'slideDown 0.3s ease-in forwards';
        setTimeout(() => {
          if (document.body.contains(errorMessage)) {
            document.body.removeChild(errorMessage);
          }
        }, 300);
      }
    }, 4000);
  };

  const handleLockOrientation = async () => {
    try {
      // Lock to portrait orientation using the improved API
      const result = await lockScreenOrientation('portrait');
      
      if (result.success) {
        setOrientationLocked(true);
        setShowWarning(false);
        showSuccessMessage(`Orientation locked to portrait (${result.method})`);
      } else {
        console.warn('Failed to lock orientation:', result.error);
        showErrorMessage(result.error || 'Failed to lock orientation');
      }
    } catch (e) {
      console.error('Failed to lock orientation:', e);
      setOrientationLocked(false);
      showErrorMessage('Orientation lock not supported on this device');
    }
  };
  
  const handleUnlockOrientation = async () => {
    try {
      // Unlock orientation using the improved API
      const result = await unlockScreenOrientation();
      
      if (result.success) {
        setOrientationLocked(false);
        showSuccessMessage(`Orientation unlocked (${result.method})`);
      } else {
        console.warn('Failed to unlock orientation:', result.error);
        showErrorMessage(result.error || 'Failed to unlock orientation');
      }
    } catch (e) {
      console.error('Failed to unlock orientation:', e);
      showErrorMessage('Orientation unlock not supported on this device');
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
          backgroundColor: 'var(--secondary)',
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
            color: 'var(--secondary)',
            marginBottom: '20px',
            animation: 'rotate-animation 2s ease-in-out infinite'
          }} 
        />
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--primary)',
          marginBottom: '16px'
        }}>
          Please Rotate Your Device
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'var(--primary)',
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
                backgroundColor: 'var(--secondary)',
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
              backgroundColor: isOrientationLockSupported ? 'rgba(255, 255, 255, 0.2)' : 'var(--secondary)',
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
          
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes slideDown {
            from {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
            to {
              transform: translateX(-50%) translateY(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </>
  );
};