/**
 * Touch Gesture Utilities for Word Search Game
 * This file contains utility functions to handle touch gestures on mobile devices
 */

// Interface for touch position
interface TouchPosition {
  x: number;
  y: number;
}

// Interface for gesture handlers
interface GestureHandlers {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void;
  onTap?: (position: TouchPosition) => void;
  onLongPress?: (position: TouchPosition) => void;
  onPinch?: (scale: number) => void;
}

// Constants for gesture detection
const SWIPE_THRESHOLD = 50; // Minimum distance for swipe detection
const LONG_PRESS_THRESHOLD = 500; // Time in ms for long press detection

/**
 * Add touch gesture handlers to an element
 * @param element - The HTML element to add gesture handlers to
 * @param handlers - Object containing gesture handler functions
 */
export const addTouchGestureHandlers = (
  element: HTMLElement,
  handlers: GestureHandlers
): (() => void) => {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let longPressTimer: number | null = null;
  let initialDistance = 0;

  // Touch start handler
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - potential swipe or tap
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();

      // Set long press timer
      if (handlers.onLongPress) {
        longPressTimer = window.setTimeout(() => {
          handlers.onLongPress?.({ x: startX, y: startY });
          longPressTimer = null;
        }, LONG_PRESS_THRESHOLD);
      }
    } else if (e.touches.length === 2 && handlers.onPinch) {
      // Two touches - potential pinch
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  // Touch move handler
  const handleTouchMove = (e: TouchEvent) => {
    // Prevent default to stop screen dragging
    e.preventDefault();

    // Cancel long press if finger moves
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (e.touches.length === 2 && handlers.onPinch && initialDistance > 0) {
      // Handle pinch gesture
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const scale = currentDistance / initialDistance;
      handlers.onPinch(scale);
    }
  };

  // Touch end handler
  const handleTouchEnd = (e: TouchEvent) => {
    // Cancel long press timer
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Calculate touch duration
    const touchDuration = Date.now() - startTime;

    // Handle tap
    if (touchDuration < LONG_PRESS_THRESHOLD && handlers.onTap) {
      handlers.onTap({ x: startX, y: startY });
    }

    // Handle swipe if we have a handler
    if (handlers.onSwipe) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Check if the movement is significant enough to be a swipe
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          const direction = deltaX > 0 ? 'right' : 'left';
          handlers.onSwipe(direction, Math.abs(deltaX));
        } else {
          // Vertical swipe
          const direction = deltaY > 0 ? 'down' : 'up';
          handlers.onSwipe(direction, Math.abs(deltaY));
        }
      }
    }
  };

  // Add event listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);

    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
    }
  };
};

/**
 * Prevent default touch behavior for an element
 * @param element - The HTML element to prevent default touch behavior for
 */
export const preventDefaultTouchBehavior = (element: HTMLElement): void => {
  const preventDefault = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  element.addEventListener('touchstart', preventDefault, { passive: false });
  element.addEventListener('touchmove', preventDefault, { passive: false });
  element.addEventListener('touchend', preventDefault, { passive: false });
};

/**
 * Configure touch behavior specifically for word grid
 * @param element - The HTML element (word grid) to configure touch behavior for
 */
export const configureWordGridTouchBehavior = (element: HTMLElement): void => {
  // Apply minimal CSS to prevent unwanted behaviors but allow touch events
  element.style.touchAction = 'pan-x pan-y';
  element.style.userSelect = 'none';
  (element.style as any)['-webkit-touch-callout'] = 'none';
  
  // We can't easily clean up existing listeners, but we can ensure we don't add duplicates
  // by using a named function that we can reference later if needed
  const preventDrag = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Only prevent default when dragging with one finger to allow pinch zoom
      e.preventDefault();
    }
  };
  
  // Add a single touchmove listener to prevent screen dragging
  element.addEventListener('touchmove', preventDrag, { passive: false });
};

/**
 * Enable momentum scrolling for an element
 * @param element - The HTML element to enable momentum scrolling for
 */
export const enableMomentumScrolling = (element: HTMLElement): void => {
  element.style.overflowY = 'scroll';
  (element.style as any)['-webkit-overflow-scrolling'] = 'touch';
};