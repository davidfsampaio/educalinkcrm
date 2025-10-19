import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    currentUser: User | null;
    hasPermission: (permission: Permission) => boolean;
    authError: string | null;
    setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        setAuthLoading(true);

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata, app_metadata } = user;

                    // Build profile exclusively from session metadata to avoid database calls that trigger recursive RLS policies.
                    let role: UserRoleName | undefined = user_metadata?.role || app_metadata?.role;
                    let schoolId: string | undefined = user_metadata?.school_id || app_metadata?.school_id;

                    // Apply specific fallbacks if information is missing for admin users.
                    if (user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com') {
                        if (!role) {
                            role = 'Admin';
                        }
                        if (!schoolId) {
                            schoolId = 'school-123';
                        }
                    }

                    // Validate if we have enough information to build a profile.
                    if (role && schoolId) {
                        const profile: User = {
                            id: user.id,
                            email: user.email!,
                            name: user_metadata?.full_name || user_metadata?.name || user.email!,
                            avatarUrl: user_metadata?.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                            role: role,
                            status: UserStatus.Active,
                            studentId: user_metadata?.student_id,
                            school_id: schoolId,
                        };
                        setCurrentUser(profile);
                        setAuthError(null);
                    } else {
                        // If critical info is still missing, throw an error.
                        let missingFields = [];
                        if (!role) missingFields.push("'role'");
                        if (!schoolId) missingFields.push("'school_id'");

                        throw new Error(`A 'carga' (${missingFields.join(' e ')}) do usuário não foi encontrada nos metadados. Acesso não permitido.`);
                    }
                } else {
                    // No session, so no user.
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                const actionMessage = "Ação necessária: Configure os campos 'role' e 'school_id' nos metadados do usuário no Supabase Auth.";
                console.error(errorMessage, actionMessage);
                setAuthError(`${errorMessage}\n${actionMessage}`);
                setCurrentUser(null);
                // Do NOT call signOut() here, as it can cause an infinite loop on the login page.
            } finally {
                setAuthLoading(false);
            }
        });

        return () => {
            // Optional chaining for safety.
            authListener?.subscription?.unsubscribe();
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

    const value = { currentUser, hasPermission, authError, setAuthError };

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