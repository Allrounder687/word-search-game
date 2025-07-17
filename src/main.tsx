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

// Initialize service worker
registerServiceWorker();

// Initialize audio context for iOS
const initAudioContext = () => {
  // Create a silent AudioContext to enable audio on iOS
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContext) {
    const audioContext = new AudioContext();
    
    // Create and play a silent buffer to unlock audio
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    // Play and immediately stop
    const startPlayback = () => {
      source.start(0);
      source.stop(0.001);
      document.removeEventListener('touchstart', startPlayback);
      document.removeEventListener('mousedown', startPlayback);
    };
    
    // Add event listeners for user interaction
    document.addEventListener('touchstart', startPlayback);
    document.addEventListener('mousedown', startPlayback);
  }
};

// Initialize audio context
initAudioContext();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
