// Utility functions for lazy loading data

// Function to get cached descriptions for a category
export const getCachedDescriptions = async (_category: string): Promise<Record<string, string>> => {
  // For now, return an empty object as we're not implementing actual caching yet
  return {};
};

// Function to preload critical descriptions
export const preloadCriticalDescriptions = async (): Promise<void> => {
  // For now, this is a no-op as we're not implementing actual preloading yet
  return;
}; 