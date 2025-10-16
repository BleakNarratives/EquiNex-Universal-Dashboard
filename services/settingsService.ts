import { Settings } from '../types';

const SETTINGS_KEY = 'equinexAiSettings-v2'; // v2 to include new settings

export const loadSettings = (): Settings => {
  const defaults: Settings = {
    activeProvider: 'Gemini',
    pollingInterval: 15000, // Default to 15 seconds
    animationsEnabled: true,
  };

  try {
    const savedSettingsJSON = localStorage.getItem(SETTINGS_KEY);
    if (savedSettingsJSON) {
      const savedSettings = JSON.parse(savedSettingsJSON);
      // Merge saved settings with defaults to ensure all keys are present
      return { ...defaults, ...savedSettings };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
  }
  
  return defaults;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
};
