import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { User, Permission, UserRoleName } from '../types';
import { useData } from './DataContext';
import { useSettings } from './SettingsContext';

interface AuthContextType {
    currentUser: User | null;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { users, loading: isUsersLoading } = useData();
    const { settings } = useSettings();
    
    // For this simulation, we'll hardcode the current user as the first user (Admin).
    const currentUser = useMemo(() => {
        if (isUsersLoading || !users || users.length === 0) {
            return null;
        }
        return users[0];
    }, [users, isUsersLoading]);
    
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

    // Wait until user and settings are loaded to render children
    if (isUsersLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Carregando sistema...</p>
            </div>
        )
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