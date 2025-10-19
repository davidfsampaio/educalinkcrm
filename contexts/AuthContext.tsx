import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission } from '../types';
import { useData } from './DataContext';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';


interface AuthContextType {
    currentUser: User | null;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { users, loading: isUsersLoading } = useData();
    const { settings } = useSettings();
    const [session, setSession] = useState<Session | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setAuthLoading(false);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const currentUser = useMemo(() => {
        if (authLoading || isUsersLoading || !session || !users) {
            return null;
        }
        // Match Supabase auth user with our public users table profile
        return users.find(u => u.email === session.user.email) || null;
    }, [session, users, isUsersLoading, authLoading]);
    
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

    if (authLoading || isUsersLoading) {
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
