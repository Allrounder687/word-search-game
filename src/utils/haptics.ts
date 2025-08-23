export const provideHapticFeedback = (intensity: number) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(intensity);
  }
};
