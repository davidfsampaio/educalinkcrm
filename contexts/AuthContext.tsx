import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { getMyProfile, addUser } from '../services/apiService';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    hasPermission: (permission: Permission) => boolean;
    authError: string | null;
    setAuthError: (error: string | null) => void;
    signInAsStaff: (email: string, pass: string) => Promise<void>;
    signInAsParent: (email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && isMounted) {
                    // Busca o perfil via RPC para evitar problemas de RLS
                    const profile = await getMyProfile();
                    if (profile && isMounted) {
                        setCurrentUser(profile);
                    }
                }
            } catch (error) {
                console.error("Error fetching initial session:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
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

        try {
            // Etapa 1: Autenticar com Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            // Etapa 2: Buscar o perfil do usuário via RPC para evitar recursão de RLS.
            let profile = await getMyProfile();
            
            // Etapa 3: Se não houver perfil (usuário novo), criar um via RPC.
            if (!profile) {
                console.warn("Perfil de usuário não encontrado, criando um novo...");

                const defaultRole = expectedRoleType === 'staff'
                    ? (email === 'admin@educalink.com' ? 'Admin' : 'Secretário(a)')
                    : 'Pai/Responsável';

                const newProfileData = {
                    email: authData.user.email!,
                    name: authData.user.email?.split('@')[0] || 'Novo Usuário',
                    role: defaultRole as UserRoleName,
                    status: 'Ativo' as UserStatus,
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // MOCK: Default school ID.
                    avatar_url: `https://picsum.photos/seed/${authData.user.id}/100/100`
                };
                
                const createdProfile = await addUser(newProfileData);

                if (!createdProfile) {
                    throw new Error(`Falha ao criar o perfil do usuário: Erro desconhecido`);
                }
                profile = createdProfile;
            }

            // Etapa 4: Verificar se o usuário está acessando o portal correto.
            const isParentRole = profile.role === 'Pai/Responsável';

            if (expectedRoleType === 'staff' && isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal de pais/responsáveis.");
            }
            
            if (expectedRoleType === 'parent' && !isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal da equipe da escola.");
            }

            // Etapa 5: Sucesso! Definir o usuário atual.
            setCurrentUser(profile as User);
            
        } catch (error: any) {
            // Em qualquer falha, garantir o logout e exibir o erro.
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAuthError(error.message);
            throw error;
        }
    };

    const signInAsStaff = async (email: string, pass: string) => {
        try {
            await performLogin(email, pass, 'staff');
        } catch (error) {
            console.error("Staff login failed:", (error as Error).message);
        }
    };

    const signInAsParent = async (email: string, pass: string) => {
         try {
            await performLogin(email, pass, 'parent');
        } catch (error) {
            console.error("Parent login failed:", (error as Error).message);
        }
    };
    
    const userPermissions = useMemo((): Set<Permission> => {
        if (!currentUser || !settings.roles) return new Set();
        const role = settings.roles.find(r => r.name === currentUser.role);
        return new Set(role ? role.permissions : []);
    }, [currentUser, settings.roles]);

    const hasPermission = (permission: Permission): boolean => userPermissions.has(permission);

    const value = { currentUser, isLoading, hasPermission, authError, setAuthError, signInAsStaff, signInAsParent };

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