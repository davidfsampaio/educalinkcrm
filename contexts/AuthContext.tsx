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
        const handleAuthStateChange = async (session: any, expectedRoleType?: 'staff' | 'parent') => {
            try {
                if (session?.user) {
                    const { user } = session;
                    // Source of Truth: Fetch the user profile from the public.users table
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profileError || !profile) {
                        throw new Error(`Não foi possível encontrar um perfil para este usuário. Verifique se o cadastro está correto.`);
                    }

                    // Role validation: Check if the user's role matches the portal they're trying to log into.
                    const userIsParent = profile.role === 'Pai/Responsável';
                    
                    if (expectedRoleType === 'staff' && userIsParent) {
                        throw new Error("Acesso negado. Este login é para a equipe da escola.");
                    }
                    if (expectedRoleType === 'parent' && !userIsParent) {
                        throw new Error("Acesso negado. Este login é exclusivo para Pais e Responsáveis.");
                    }
                    
                    // If all checks pass, set the current user
                    setCurrentUser(profile as User);
                    setAuthError(null);
                } else {
                    // No session, user is logged out.
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = error.message;
                console.error(`Erro de autenticação: ${errorMessage}`);
                setAuthError(errorMessage);
                setCurrentUser(null);
                // Log the user out to be safe and clear any bad state.
                await supabase.auth.signOut();
            } finally {
                setAuthLoading(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthLoading(true);
            
            // Determine the portal context from the UI state if possible
            const currentPath = window.location.pathname; // This is a simplified proxy
            let expectedRole: 'staff' | 'parent' | undefined = undefined;

            // This logic is a bit of a hack, a better solution would involve state management for the login view
            // But it helps direct the role validation on auth state changes.
            if (session) {
                // When auth state changes due to login, we need to know WHICH login it was.
                // We'll rely on the error messages set by the login screens for this.
            }

            handleAuthStateChange(session);
        });
        
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthStateChange(session);
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
                <p>Verificando sessão...</p>
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