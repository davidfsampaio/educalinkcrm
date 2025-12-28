
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
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
    const isAuthenticating = useRef(false);

    // Função centralizada para carregar perfil com timeout de 8 segundos
    const loadProfile = useCallback(async (userId: string) => {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("O banco de dados demorou muito a responder. Verifique se o projeto Supabase está ativo.")), 8000)
        );

        try {
            const profile = await Promise.race([getUserById(userId), timeoutPromise]) as User | null;
            setCurrentUser(profile);
            return profile;
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            setCurrentUser(null);
            throw error;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;
                
                // Se já estivermos no meio de um performLogin, deixamos ele gerenciar o estado
                if (isAuthenticating.current) return;

                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                    setAuthError(null);
                    setIsLoading(false);
                } else if (session?.user) {
                    setIsLoading(true);
                    try {
                        await loadProfile(session.user.id);
                    } catch (e) {
                        setAuthError((e as Error).message);
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, [loadProfile]);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);
        isAuthenticating.current = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

            if (error) {
                let errorMessage = error.message;
                if (error.message === 'Invalid login credentials') {
                    errorMessage = 'Email ou senha incorretos.';
                }
                throw new Error(errorMessage);
            }
            
            if (!data.user) throw new Error("Usuário não encontrado no sistema de autenticação.");
            
            // Tenta carregar o perfil
            let profile = await loadProfile(data.user.id);
            
            // Pequena espera e re-tentativa caso haja delay em triggers do banco
            if (!profile) {
                await new Promise(r => setTimeout(r, 1500));
                profile = await loadProfile(data.user.id);
            }

            if (!profile) {
                throw new Error(`Seu e-mail (${email}) está autenticado, mas não existe um registro correspondente na tabela de 'users' da escola.`);
            }

            // Verificação de portal
            const isParent = profile?.role === 'Pai/Responsável';
            if (expectedRoleType === 'staff' && isParent) {
                await supabase.auth.signOut();
                throw new Error("Este e-mail pertence a um Responsável. Use o portal de Pais.");
            }
            if (expectedRoleType === 'parent' && !isParent) {
                await supabase.auth.signOut();
                throw new Error("Este e-mail pertence à Equipe. Use o portal da Escola.");
            }

        } catch (error: any) {
            setAuthError(error.message || "Erro inesperado ao autenticar.");
            setIsLoading(false);
            throw error;
        } finally {
            isAuthenticating.current = false;
            // Só paramos o loading global se não houve erro, ou o AppRouter vai unmountar o login
            // Na verdade, se houve erro, setIsLoading(false) é essencial para o login voltar a aparecer
            setIsLoading(false);
        }
    };

    const signInAsStaff = async (email: string, pass: string) => performLogin(email, pass, 'staff');
    const signInAsParent = async (email: string, pass: string) => performLogin(email, pass, 'parent');
    
    const hasPermission = (permission: Permission): boolean => {
        if (currentUser?.role === 'Admin') return true;
        return userPermissions.has(permission);
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser, isLoading, hasPermission, authError, setAuthError, 
            signInAsStaff, signInAsParent, setUserPermissions 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
