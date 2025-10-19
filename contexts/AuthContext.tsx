import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import * as api from '../services/apiService';


interface AuthContextType {
    currentUser: User | null;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        setAuthLoading(true);

        // Explicitly check for an existing session on initial load
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user?.email) {
                const profile = await api.getUserProfileByEmail(session.user.email);
                setCurrentUser(profile);
            } else {
                setCurrentUser(null);
            }
            setAuthLoading(false);
        });

        // Listen for subsequent auth state changes (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user?.email) {
                const profile = await api.getUserProfileByEmail(session.user.email);
                setCurrentUser(profile);
            } else {
                setCurrentUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    const userPermissions = useMemo((): Set<Permission> => {
        if (!currentUser || !settings.roles) {
            return new Set();
        }
        const role = settings.roles.find(r => r.name === currentUser.role);
        return new Set(role ? role.permissions : []);
    }, [currentUser, settings.roles]);

    const hasPermission = (permission: Permission): boolean => {
        return userPermissions.has(permission);
    };

    const value = { currentUser, hasPermission };

    if (authLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Carregando sistema...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};