
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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

    // Função centralizada para carregar perfil
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const profile = await getUserById(userId);
            setCurrentUser(profile);
            return profile;
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            setCurrentUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Listener reativo do Supabase é mais confiável que getSession manual no início
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                    setAuthError(null);
                    setIsLoading(false);
                } else if (session?.user) {
                    await loadProfile(session.user.id);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            }
        );

        // Timeout Hard de 5 segundos: Se nada acontecer, destrava a tela de qualquer forma
        const failsafe = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("Auth failsafe triggered. Forcing loading to false.");
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
            clearTimeout(failsafe);
        };
    }, [isLoading, loadProfile]);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

            if (error) {
                let errorMessage = error.message;
                if (error.message === 'Invalid login credentials') {
                    errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
                }
                throw new Error(errorMessage);
            }
            
            if (!data.user) throw new Error("Usuário não encontrado.");
            
            const profile = await loadProfile(data.user.id);
            
            if (!profile) {
                // Pequena espera para triggers de banco de dados
                await new Promise(r => setTimeout(r, 1000));
                const retryProfile = await loadProfile(data.user.id);
                if (!retryProfile) throw new Error(`Perfil não criado no banco de dados.`);
            }

            // Verificação de tipos de portal
            const isParent = profile?.role === 'Pai/Responsável';
            if (expectedRoleType === 'staff' && isParent) {
                await supabase.auth.signOut();
                throw new Error("Acesso negado. Este é o portal da equipe.");
            }
            if (expectedRoleType === 'parent' && !isParent) {
                await supabase.auth.signOut();
                throw new Error("Acesso negado. Este é o portal de pais.");
            }

        } catch (error: any) {
            setAuthError(error.message || "Erro ao autenticar.");
            throw error;
        } finally {
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
