

declare global {
  // FIX: Moved AIStudio interface inside declare global to resolve type conflict with other files.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { supabase } from '../services/supabaseClient';
import { getUsers } from '../services/apiService';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    hasPermission: (permission: Permission) => boolean;
    authError: string | null;
    setAuthError: (error: string | null) => void;
    signInAsStaff: (email: string, pass: string) => Promise<void>;
    signInAsParent: (email: string, pass: string) => Promise<void>;
    setUserPermissions: (permissions: Set<Permission>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<Set<Permission>>(new Set());

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && isMounted) {
                    const allUsers = await getUsers();
                    const profile = allUsers.find(u => u.id === session.user.id);
                    
                    if (profile && isMounted) {
                        setCurrentUser(profile);
                    } else if (isMounted) {
                        setCurrentUser(null);
                    }
                }
            } catch (error) {
                console.error("Error checking initial session:", error);
                 if (isMounted) {
                    setCurrentUser(null);
                 }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    if (isMounted) {
                        setCurrentUser(null);
                        setAuthError(null);
                    }
                } else if (event === 'SIGNED_IN' && session) {
                    try {
                        const allUsers = await getUsers();
                        const profile = allUsers.find(u => u.id === session.user.id);
                        if (profile && isMounted) {
                            setCurrentUser(profile);
                        }
                    } catch (e) {
                        console.error("Error loading profile after sign in", e);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

            if (error) {
                // Tradução de erros comuns do Supabase Auth
                let errorMessage = error.message;
                if (error.message === 'Invalid login credentials') {
                    errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Por favor, confirme seu email antes de acessar.';
                }
                throw new Error(errorMessage);
            }
            
            if (!data.user) {
                throw new Error("Falha na autenticação. Usuário não encontrado.");
            }
            
            const allUsers = await getUsers();
            let profile = allUsers.find(u => u.id === data.user!.id);
            
            if (!profile) {
                // Pequeno atraso para o trigger do DB criar o perfil se necessário
                await new Promise(resolve => setTimeout(resolve, 1500));
                const refetchedUsers = await getUsers();
                profile = refetchedUsers.find(u => u.id === data.user!.id);
                if (!profile) {
                    throw new Error(`Perfil não encontrado. Certifique-se de que sua conta está ativa.`);
                }
            }

            const isParentRole = profile.role === 'Pai/Responsável';
            if (expectedRoleType === 'staff' && isParentRole) {
                await supabase.auth.signOut();
                throw new Error("Acesso negado. Utilize o portal de pais/responsáveis.");
            }
            if (expectedRoleType === 'parent' && !isParentRole) {
                await supabase.auth.signOut();
                throw new Error("Acesso negado. Utilize o portal da equipe da escola.");
            }

            setCurrentUser(profile);
            
        } catch (error: any) {
            // FIX: Garantir que a mensagem seja sempre uma string para evitar [object Object]
            const message = typeof error === 'string' ? error : (error.message || "Erro desconhecido ao tentar fazer login.");
            setAuthError(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signInAsStaff = async (email: string, pass: string) => {
        await performLogin(email, pass, 'staff');
    };

    const signInAsParent = async (email: string, pass: string) => {
        await performLogin(email, pass, 'parent');
    };
    
    const hasPermission = (permission: Permission): boolean => {
        if (currentUser?.role === 'Admin') return true;
        return userPermissions.has(permission);
    };

    const value = { 
        currentUser, 
        isLoading, 
        hasPermission, 
        authError, 
        setAuthError, 
        signInAsStaff, 
        signInAsParent, 
        setUserPermissions 
    };

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
