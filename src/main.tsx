import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA support
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
};

// Initialize audio context for iOS - but only after user interaction
const initAudioContext = () => {
  // Function to create and initialize AudioContext
  const setupAudioContext = () => {
    // Create a silent AudioContext to enable audio on iOS
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      try {
        const audioContext = new AudioContext();
        
        // Create and play a silent buffer to unlock audio
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        
        // Play and immediately stop
        source.start(0);
        source.stop(0.001);
        
        // Store the audio context in window for reuse
        (window as any).gameAudioContext = audioContext;
        
        // Clean up event listeners
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('mousedown', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
        
        console.log('AudioContext initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize AudioContext:', error);
      }
    }
  };
  
  // Handler for user interaction
  const handleUserInteraction = () => {
    setupAudioContext();
  };
  
  // Add event listeners for user interaction
  document.addEventListener('touchstart', handleUserInteraction);
  document.addEventListener('mousedown', handleUserInteraction);
  document.addEventListener('click', handleUserInteraction);
};

// Initialize service worker
registerServiceWorker();

// Initialize audio context (will wait for user interaction)
initAudioContext();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)