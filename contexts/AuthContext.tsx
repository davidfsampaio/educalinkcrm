
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

    const loadProfile = useCallback(async (userId: string) => {
        try {
            console.log(`[Auth] Buscando perfil: ${userId}`);
            // Timeout de 10 segundos para busca no banco público
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao conectar com o banco de dados.")), 10000));
            const profile = await Promise.race([getUserById(userId), timeoutPromise]) as User | null;
            
            if (profile) {
                setCurrentUser(profile);
                setAuthError(null);
            } else {
                // Usuário autenticado no Supabase mas sem registro na tabela public.users
                setCurrentUser(null);
                const { data } = await supabase.auth.getUser();
                setAuthError(`Seu e-mail (${data.user?.email}) está autenticado, mas não existe um registro correspondente na tabela de 'users' da escola.`);
            }
        } catch (error) {
            console.error("[Auth] Erro ao carregar perfil:", error);
            setAuthError("Erro de conexão com o banco de dados.");
            setCurrentUser(null);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Monitorar estado da sessão
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            if (session) {
                loadProfile(session.user.id).finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;
                console.log(`[Auth] Evento: ${event}`);

                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                    setAuthError(null);
                    setIsLoading(false);
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user && !currentUser) {
                        setIsLoading(true);
                        await loadProfile(session.user.id);
                        setIsLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, [loadProfile, currentUser]);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);
        isAuthenticating.current = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            if (!data.user) throw new Error("Falha na autenticação.");
            
            await loadProfile(data.user.id);
        } catch (error: any) {
            setAuthError(error.message || "Erro ao fazer login.");
            throw error;
        } finally {
            isAuthenticating.current = false;
            setIsLoading(false);
        }
    };

    const signInAsStaff = (email: string, pass: string) => performLogin(email, pass, 'staff');
    const signInAsParent = (email: string, pass: string) => performLogin(email, pass, 'parent');
    
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
