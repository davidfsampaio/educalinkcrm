
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { supabase } from '../services/supabaseClient';
import { getUserById } from '../services/apiService';

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
            // Timeout de segurança: se o Supabase não responder em 6 segundos, liberamos a tela
            const timeoutId = setTimeout(() => {
                if (isMounted && isLoading) {
                    console.warn("Session check timed out. Proceeding as guest.");
                    setIsLoading(false);
                }
            }, 6000);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;

                if (session && isMounted) {
                    try {
                        // Busca otimizada: busca APENAS o perfil do usuário logado
                        const profile = await getUserById(session.user.id);
                        if (isMounted) setCurrentUser(profile);
                    } catch (profileError) {
                        console.error("Erro ao carregar perfil:", profileError);
                        if (isMounted) setCurrentUser(null);
                    }
                } else if (isMounted) {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Erro geral na verificação de sessão:", error);
                 if (isMounted) {
                    setCurrentUser(null);
                 }
            } finally {
                if (isMounted) {
                    clearTimeout(timeoutId);
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
                        const profile = await getUserById(session.user.id);
                        if (profile && isMounted) {
                            setCurrentUser(profile);
                        }
                    } catch (e) {
                        console.error("Erro ao recarregar perfil após login:", e);
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
            
            let profile: User | null = null;
            try {
                profile = await getUserById(data.user.id);
            } catch (e) {
                // Atraso curto caso o trigger do banco esteja processando a criação do perfil
                await new Promise(resolve => setTimeout(resolve, 1500));
                profile = await getUserById(data.user.id);
            }
            
            if (!profile) {
                throw new Error(`Perfil não encontrado para o usuário ${data.user.id}.`);
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
