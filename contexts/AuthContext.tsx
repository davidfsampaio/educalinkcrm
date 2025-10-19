import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import * as api from '../services/apiService'; // Import the api service

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
                    let profile: User | null = null;

                    // Step 1: Attempt to get profile via RPC call first. This is the most reliable way to bypass RLS issues.
                    const rpcProfileResult = await api.getAuthenticatedUserProfile();

                    if (typeof rpcProfileResult === 'object' && rpcProfileResult !== null) {
                        // Ideal case: RPC returned the full staff profile.
                        profile = {
                            id: user.id,
                            email: user.email!,
                            name: rpcProfileResult.name,
                            avatarUrl: rpcProfileResult.avatarUrl || user.user_metadata?.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                            role: rpcProfileResult.role as UserRoleName,
                            status: UserStatus.Active,
                            school_id: rpcProfileResult.school_id,
                        };
                    } else {
                        // Fallback case: RPC returned a string (role), null, or failed. We must rely on session metadata.
                        console.warn("RPC 'get_my_role' did not return a full user profile object. Falling back to session metadata.");
                        
                        const { user_metadata, app_metadata } = user;

                        // Try to get role from RPC result (if it's a string) or from metadata.
                        let role: UserRoleName | undefined = (typeof rpcProfileResult === 'string' ? rpcProfileResult as UserRoleName : undefined) || user_metadata?.role || app_metadata?.role;
                        
                        // Try to get school_id from metadata.
                        let schoolId: string | undefined = user_metadata?.school_id || app_metadata?.school_id;

                        // Apply specific fallbacks if information is still missing.
                        if (!role && user.email === 'admin@educalink.com') {
                            role = 'Admin';
                        }
                        if (!schoolId && role === 'Admin') {
                            schoolId = 'school-123';
                        }

                        // Now, validate if we have enough information to build a profile.
                        if (role && schoolId) {
                            profile = {
                                id: user.id,
                                email: user.email!,
                                name: user_metadata?.full_name || user_metadata?.name || user.email!,
                                avatarUrl: user_metadata?.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                                role: role,
                                status: UserStatus.Active,
                                studentId: user_metadata?.student_id,
                                school_id: schoolId,
                            };
                        } else {
                            if (!role) {
                                throw new Error("O 'cargo' (role) do usuário não foi encontrado. Acesso não permitido.");
                            }
                            if (!schoolId) {
                                throw new Error("A 'escola' (school_id) do usuário não foi encontrada. Acesso não permitido.");
                            }
                        }
                    }

                    setCurrentUser(profile);
                    setAuthError(null);

                } else {
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                console.error(errorMessage, "Ação necessária: Verifique a configuração de metadados do usuário no Supabase Auth e a função RPC 'get_my_role' no backend.");
                setAuthError(errorMessage);
                setCurrentUser(null);
                await supabase.auth.signOut();
            } finally {
                setAuthLoading(false);
            }
        });

        return () => {
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
