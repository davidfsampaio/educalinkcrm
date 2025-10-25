import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Settings, Role } from '../types';
import { defaultSettings } from '../data/settingsData';
import * as api from '../services/apiService';
import { useAuth } from './AuthContext';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Omit<Settings, 'roles' | 'tuitionPlans'>>) => Promise<void>;
    updateRoles: (newRoles: Role[]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        const loadSettings = async () => {
            if (currentUser?.school_id) {
                try {
                    const dbSettings = await api.getSchoolSettings();
                    if (dbSettings) {
                        // Mapeamento direto do banco de dados (snake_case) para a aplicação (camelCase)
                        setSettings(prev => ({
                            ...prev,
                            schoolInfo: {
                                name: dbSettings.name || prev.schoolInfo.name,
                                address: dbSettings.address || prev.schoolInfo.address,
                                phone: dbSettings.phone || prev.schoolInfo.phone,
                                email: dbSettings.email || prev.schoolInfo.email,
                                logoUrl: dbSettings.logo_url || prev.schoolInfo.logoUrl,
                                cnpj: dbSettings.cnpj || prev.schoolInfo.cnpj,
                            },
                            classes: dbSettings.classes || prev.classes,
                            staffRoles: dbSettings.staff_roles || prev.staffRoles,
                            roles: dbSettings.roles || prev.roles,
                            declarationTemplates: dbSettings.declaration_templates || prev.declarationTemplates,
                        }));
                    }
                } catch (error) {
                    console.error("Failed to load school settings:", error);
                }
            }
        };
        loadSettings();
    }, [currentUser]);

    const updateSettings = async (newSettings: Partial<Omit<Settings, 'roles' | 'tuitionPlans'>>) => {
        if (!currentUser?.school_id) {
            alert("Erro: não foi possível identificar a escola do usuário. A sessão pode ter expirado.");
            return;
        }

        // Mapeamento direto da aplicação (camelCase) para o banco de dados (snake_case)
        const payload: any = {};
        if (newSettings.schoolInfo) {
            payload.name = newSettings.schoolInfo.name;
            payload.address = newSettings.schoolInfo.address;
            payload.phone = newSettings.schoolInfo.phone;
            payload.email = newSettings.schoolInfo.email;
            payload.logo_url = newSettings.schoolInfo.logoUrl;
            payload.cnpj = newSettings.schoolInfo.cnpj;
        }
        if (newSettings.classes) payload.classes = newSettings.classes;
        if (newSettings.staffRoles) payload.staff_roles = newSettings.staffRoles;
        if (newSettings.declarationTemplates) payload.declaration_templates = newSettings.declarationTemplates;

        try {
            await api.updateSchoolSettings(currentUser.school_id, payload);
            setSettings(prev => ({
                ...prev,
                ...newSettings,
            }));
        } catch (error) {
            console.error("Failed to update settings:", error);
            alert(`Erro ao salvar configurações: ${(error as Error).message}`);
        }
    };

    const updateRoles = async (newRoles: Role[]) => {
        if (!currentUser?.school_id) {
            alert("Erro: não foi possível identificar a escola do usuário. A sessão pode ter expirado.");
            return;
        }
        try {
            await api.updateSchoolSettings(currentUser.school_id, { roles: newRoles });
            setSettings(prev => ({ ...prev, roles: newRoles }));
        } catch (error) {
            console.error("Failed to update roles:", error);
            alert(`Erro ao salvar permissões: ${(error as Error).message}`);
        }
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