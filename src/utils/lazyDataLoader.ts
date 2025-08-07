// Lazy loader for large data structures to improve initial bundle size
import type { WordCategory } from '../types/game';

// Lazy loading functions for descriptions
export const loadDescriptions = async (category: WordCategory) => {
  switch (category) {
    case 'fivePillars':
      try {
        const { FIVE_PILLARS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return FIVE_PILLARS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicProphets':
      try {
        const { PROPHETS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return PROPHETS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicMonths':
      try {
        const { ISLAMIC_MONTHS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return ISLAMIC_MONTHS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'muslimScientists':
      try {
        const { MUSLIM_SCIENTISTS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return MUSLIM_SCIENTISTS_DESCRIPTIONS;
      } catch {
        return {};
      }

    case 'quranicSurahs':
      try {
        const { QURANIC_SURAHS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return QURANIC_SURAHS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicValues':
      try {
        const { ISLAMIC_VALUES_DESCRIPTIONS } = await import('../types/islamicDescriptions');
        return ISLAMIC_VALUES_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicPlaces':
      try {
        const { ISLAMIC_PLACES_DESCRIPTIONS } = await import('../types/islamicPlacesDescriptions');
        return Object.fromEntries(
          Object.entries(ISLAMIC_PLACES_DESCRIPTIONS).map(([key, value]) => [
            key,
            typeof value === 'object' ? value.description : value
          ])
        );
      } catch {
        return {};
      }
    
    case 'islamicAngels':
      try {
        const { ISLAMIC_ANGELS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
        return ISLAMIC_ANGELS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicBooks':
      try {
        const { ISLAMIC_BOOKS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
        return ISLAMIC_BOOKS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicEvents':
      try {
        const { ISLAMIC_EVENTS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
        return ISLAMIC_EVENTS_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    case 'islamicVirtues':
      try {
        const { ISLAMIC_VIRTUES_DESCRIPTIONS } = await import('../types/islamicNewCategories');
        return ISLAMIC_VIRTUES_DESCRIPTIONS;
      } catch {
        return {};
      }
    
    default:
      return {};
  }
};

// Cache for loaded descriptions to avoid repeated imports
const descriptionCache = new Map<WordCategory, Record<string, string>>();

export const getCachedDescriptions = async (category: WordCategory): Promise<Record<string, string>> => {
  if (descriptionCache.has(category)) {
    return descriptionCache.get(category)!;
  }
  
  const descriptions = await loadDescriptions(category);
  descriptionCache.set(category, descriptions);
  return descriptions;
};

// Preload critical descriptions for better UX
export const preloadCriticalDescriptions = async () => {
  // Preload commonly used categories
  const criticalCategories: WordCategory[] = ['fivePillars', 'islamicProphets'];
  
  await Promise.all(
    criticalCategories.map(category => getCachedDescriptions(category))
  );
};

// Clear cache when needed
export const clearDescriptionCache = () => {
  descriptionCache.clear();
};
