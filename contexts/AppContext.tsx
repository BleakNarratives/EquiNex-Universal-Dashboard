import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Theme, Persona, GlobalAlertState, UserProfile } from '../types';
import { themes } from '../styles/themes';

// --- THEME CONTEXT ---
interface ThemeContextType {
  theme: Theme;
  persona: Persona;
  setTheme: (themeName: string) => void;
  setPersona: (persona: Persona) => void;
  exportProfile: () => void;
  importProfile: (profile: UserProfile) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within an AppContextProvider');
  return context;
};

// --- ALERT CONTEXT ---
interface AlertContextType {
  globalAlert: GlobalAlertState | null;
  triggerAlert: (level: 'CRITICAL' | 'WARN', message: string) => void;
  dismissAlert: () => void;
}
const AlertContext = createContext<AlertContextType | undefined>(undefined);
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within an AppContextProvider');
    return context;
};

// --- VOICE CONNECTION CONTEXT ---
export type VoiceConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
interface VoiceConnectionContextType {
    status: VoiceConnectionStatus;
    transcription: { user: string; assistant: string; };
    toggleConnection: () => void;
}
const VoiceConnectionContext = createContext<VoiceConnectionContextType | undefined>(undefined);
export const useVoiceConnection = () => {
    const context = useContext(VoiceConnectionContext);
    if (!context) throw new Error('useVoiceConnection must be used within an AppContextProvider');
    return context;
};

// --- MAIN APP CONTEXT PROVIDER ---
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Theme State
    const [theme, setThemeState] = useState<Theme>(themes.default);
    const [persona, setPersonaState] = useState<Persona>('default');

    // FIX: Replaced original useEffect with robust state persistence.
    // This loads the user profile on mount and saves it on change,
    // preventing state corruption that caused the setProperty error.
    useEffect(() => {
        // Load user profile from local storage on initial mount
        try {
            const savedProfileJSON = localStorage.getItem('equinex-user-profile');
            if (savedProfileJSON) {
                const profile = JSON.parse(savedProfileJSON);
                // Validate the loaded profile before applying
                if (profile && typeof profile.persona === 'string' && typeof profile.themeName === 'string' && themes[profile.themeName]) {
                    setPersonaState(profile.persona);
                    setThemeState(themes[profile.themeName]);
                }
            }
        } catch (error) {
            console.error("Failed to load or parse user profile from localStorage:", error);
            localStorage.removeItem('equinex-user-profile'); // Clear corrupted data
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        // Apply theme CSS properties and persist state changes
        Object.entries(theme.properties).forEach(([key, value]) => {
            // The error on line 56 occurred here. The root cause is state corruption.
            // By validating on load, we ensure `value` is always a string.
            document.documentElement.style.setProperty(key, value);
        });
        
        // Persist profile changes to local storage
        const profileToSave: UserProfile = { persona, themeName: theme.name };
        localStorage.setItem('equinex-user-profile', JSON.stringify(profileToSave));

    }, [theme, persona]);


    const setTheme = (themeName: string) => {
        const newTheme = themes[themeName] || themes.default;
        setThemeState(newTheme);
    };
    
    const setPersona = (newPersona: Persona) => {
        setPersonaState(newPersona);
        // Automatically switch theme when persona changes
        const themeName = Object.keys(themes).find(key => key === newPersona) || 'default';
        setTheme(themeName);
    };

    // Alert State
    const [globalAlert, setGlobalAlert] = useState<GlobalAlertState | null>(null);
    const triggerAlert = useCallback((level: 'CRITICAL' | 'WARN', message: string) => {
        setGlobalAlert({ id: Date.now(), level, message });
    }, []);
    const dismissAlert = () => setGlobalAlert(null);
    
    // Profile Transfer
    const exportProfile = () => {
        const profile: UserProfile = {
            persona: persona,
            themeName: theme.name,
        };
        const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'equinex_profile.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importProfile = (profile: UserProfile) => {
        // Add robust validation for imported profile file
        if (profile && typeof profile.persona === 'string' && typeof profile.themeName === 'string' && themes[profile.themeName]) {
            setPersona(profile.persona);
            setTheme(profile.themeName);
            triggerAlert('WARN', 'User profile successfully imported.');
        } else {
            triggerAlert('CRITICAL', 'Invalid or corrupted profile file.');
        }
    };


    // Voice Connection State (Mock Implementation)
    const [voiceStatus, setVoiceStatus] = useState<VoiceConnectionStatus>('DISCONNECTED');
    const [transcription, setTranscription] = useState({ user: '', assistant: '' });

    const toggleConnection = () => {
        if (voiceStatus === 'CONNECTED' || voiceStatus === 'CONNECTING') {
            setVoiceStatus('DISCONNECTED');
            setTranscription({ user: '', assistant: '' });
        } else {
            setVoiceStatus('CONNECTING');
            setTimeout(() => {
                // Simulate a successful connection or an error
                if (Math.random() > 0.1) {
                    setVoiceStatus('CONNECTED');
                    setTranscription({ user: 'User input transcription appears here.', assistant: 'Assistant response appears here.' });
                } else {
                    setVoiceStatus('ERROR');
                    triggerAlert('WARN', 'Voice connection failed to establish.');
                }
            }, 2000);
        }
    };
    
    return (
        <ThemeContext.Provider value={{ theme, persona, setTheme, setPersona, exportProfile, importProfile }}>
            <AlertContext.Provider value={{ globalAlert, triggerAlert, dismissAlert }}>
                <VoiceConnectionContext.Provider value={{ status: voiceStatus, transcription, toggleConnection }}>
                    {children}
                </VoiceConnectionContext.Provider>
            </AlertContext.Provider>
        </ThemeContext.Provider>
    );
};
