import { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { getAudioFile } from '../types/kidsMode';

declare global {
  interface Window {
    MSStream?: unknown;
    gameAudioContext?: AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

interface AudioPronunciationProps {
  word: string;
  color: string;
  kidsMode: boolean;
}

export const AudioPronunciation: React.FC<AudioPronunciationProps> = ({ word, color, kidsMode }) => {
  useEffect(() => {
    if (!kidsMode || !getAudioFile(word)) return;

    // Function to initialize audio on iOS
    const initializeAudioForIOS = () => {
      // Create a silent audio element to unlock audio on iOS
      const silentAudio = document.createElement('audio');
      silentAudio.setAttribute('src', 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV');
      silentAudio.setAttribute('playsinline', 'true');
      silentAudio.setAttribute('preload', 'auto');
      silentAudio.className = 'audio-enabled';
      document.body.appendChild(silentAudio);

      // Play and immediately pause to enable audio
      const playPromise = silentAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          silentAudio.pause();
        }).catch((error: Error) => {
          console.error('Audio initialization failed:', error);
        });
      }
    };

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      // Add event listener for user interaction
      const handleUserInteraction = () => {
        initializeAudioForIOS();
        // Remove event listeners after initialization
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };

      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('click', handleUserInteraction);

      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [kidsMode, word]);

  // Don't render if kids mode is disabled or no audio file exists
  if (!kidsMode || !getAudioFile(word)) return null;

  const handlePlayAudio = () => {
    try {
      // First try to use the browser's speech synthesis API
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(word);

        // Configure the utterance
        utterance.rate = 0.8; // Slightly slower for clearer pronunciation
        utterance.volume = 1.0; // Maximum volume
        utterance.pitch = 1.0; // Normal pitch

        // Add vibration feedback for mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        // Log for debugging
        console.log(`Playing audio for ${word}`);

        // Speak the word
        window.speechSynthesis.speak(utterance);

        // iOS requires user interaction to play audio
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          // No need to call initializeAudioForIOS here, it's handled by the useEffect
        }
      } else {
        // Fallback to Audio API
        const audio = new Audio();
        audio.src = `data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV`;
        audio.volume = 1.0;

        // Play the audio
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: Error) => {
            console.error('Audio playback failed:', error);

            // Try one more fallback - create a beep sound using Web Audio API
            try {
              // Use the shared AudioContext if available
              const audioContext = window.gameAudioContext ||
                new (window.AudioContext || window.webkitAudioContext)();

              // Resume the audio context if it's suspended
              if (audioContext.state === 'suspended') {
                audioContext.resume().catch((err: Error) => {
                  console.warn('Failed to resume AudioContext:', err);
                });
              }

              const oscillator = audioContext.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
              oscillator.connect(audioContext.destination);
              oscillator.start();
              oscillator.stop(audioContext.currentTime + 0.2); // Short beep

              // Store the AudioContext for future use if we created a new one
              if (!window.gameAudioContext) {
                window.gameAudioContext = audioContext;
              }
            } catch (err) {
              console.error('Web Audio API failed:', err);
            }
          });
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  // Determine if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <button
      onClick={handlePlayAudio}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '8px' : '4px',
        width: isMobile ? '44px' : 'auto',
        height: isMobile ? '44px' : 'auto',
        borderRadius: '50%',
        transition: 'all 0.2s',
        boxShadow: isMobile ? '0 2px 5px rgba(0, 0, 0, 0.2)' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(1.2)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={`Hear how to pronounce ${word}`}
      aria-label={`Hear how to pronounce ${word}`}
    >
      <Volume2 size={isMobile ? 24 : 20} style={{ color }} />
    </button>
  );
};