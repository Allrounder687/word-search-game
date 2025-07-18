/**
 * Type declarations for screen orientation APIs
 * These declarations extend the standard Screen interface to include
 * vendor-specific orientation locking methods
 */

interface ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  type: OrientationType;
  angle: number;
  onchange: ((this: ScreenOrientation, ev: Event) => any) | null;
  addEventListener<K extends keyof ScreenOrientationEventMap>(
    type: K,
    listener: (this: ScreenOrientation, ev: ScreenOrientationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ScreenOrientationEventMap>(
    type: K,
    listener: (this: ScreenOrientation, ev: ScreenOrientationEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  dispatchEvent(event: Event): boolean;
}

interface ScreenOrientationEventMap {
  change: Event;
}

type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

type OrientationType =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

// Extend the Screen interface to include vendor-specific orientation methods
interface Screen {
  orientation?: ScreenOrientation;
  msLockOrientation?: (orientation: string | string[]) => boolean;
  mozLockOrientation?: (orientation: string | string[]) => boolean;
  msUnlockOrientation?: () => void;
  mozUnlockOrientation?: () => void;
}