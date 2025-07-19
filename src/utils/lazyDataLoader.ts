// Lazy loader for large data structures to improve initial bundle size
import type { WordCategory } from '../types/game';

// Lazy loading functions for descriptions
export const loadDescriptions = async (category: WordCategory) => {
  switch (category) {
    case 'fivePillars':
      const { FIVE_PILLARS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return FIVE_PILLARS_DESCRIPTIONS;
    
    case 'islamicProphets':
      const { PROPHETS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return PROPHETS_DESCRIPTIONS;
    
    case 'islamicMonths':
      const { ISLAMIC_MONTHS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return ISLAMIC_MONTHS_DESCRIPTIONS;
    
    case 'muslimScientists':
      const { MUSLIM_SCIENTISTS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return MUSLIM_SCIENTISTS_DESCRIPTIONS;
    

    case 'quranicSurahs':
      const { QURANIC_SURAHS_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return QURANIC_SURAHS_DESCRIPTIONS;
    
    case 'islamicValues':
      const { ISLAMIC_VALUES_DESCRIPTIONS } = await import('../types/islamicDescriptions');
      return ISLAMIC_VALUES_DESCRIPTIONS;
    
    case 'islamicPlaces':
      const { ISLAMIC_PLACES_DESCRIPTIONS } = await import('../types/islamicPlacesDescriptions');
      return Object.fromEntries(
        Object.entries(ISLAMIC_PLACES_DESCRIPTIONS).map(([key, value]) => [
          key,
          typeof value === 'object' ? value.description : value
        ])
      );
    
    case 'islamicAngels':
      const { ISLAMIC_ANGELS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
      return ISLAMIC_ANGELS_DESCRIPTIONS;
    
    case 'islamicBooks':
      const { ISLAMIC_BOOKS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
      return ISLAMIC_BOOKS_DESCRIPTIONS;
    
    case 'islamicEvents':
      const { ISLAMIC_EVENTS_DESCRIPTIONS } = await import('../types/islamicNewCategories');
      return ISLAMIC_EVENTS_DESCRIPTIONS;
    
    case 'islamicVirtues':
      const { ISLAMIC_VIRTUES_DESCRIPTIONS } = await import('../types/islamicNewCategories');
      return ISLAMIC_VIRTUES_DESCRIPTIONS;
    
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