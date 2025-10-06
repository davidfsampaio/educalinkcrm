import React, { createContext, useContext, ReactNode, useState } from 'react';
// FIX: Corrected import path for types.
import { Settings, Role } from '../types';
// FIX: Corrected import path for settings data.
import { defaultSettings } from '../data/settingsData';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Omit<Settings, 'roles'>>) => void;
    updateRoles: (newRoles: Role[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const updateSettings = (newSettings: Partial<Omit<Settings, 'roles'>>) => {
        setSettings(prev => ({...prev, ...newSettings}));
        // In a real app, you'd persist this to a backend or local storage
    };

    const updateRoles = (newRoles: Role[]) => {
         setSettings(prev => ({...prev, roles: newRoles}));
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateRoles }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};