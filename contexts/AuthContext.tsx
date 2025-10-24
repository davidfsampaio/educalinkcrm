import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { getUsers, addUser } from '../services/apiService';

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

        async function checkSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && isMounted) {
                    const allUsers = await getUsers();
                    const profile = allUsers.find(u => u.id === session.user.id);
                    
                    if (profile && isMounted) {
                        setCurrentUser(profile);
                    } else if (isMounted) {
                        console.warn("Session found but no profile. Treating user as logged out on the client.");
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
            (event, session) => {
                if (event === 'SIGNED_OUT') {
                    if (isMounted) {
                        setCurrentUser(null);
                        setAuthError(null);
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

        try {
            let authResponse;

            // Etapa 1: Tentar fazer login
            authResponse = await supabase.auth.signInWithPassword({ email, password: pass });

            // Etapa 1.5: Lógica de Autocorreção.
            // Se o login falhar por credenciais inválidas, pode ser um usuário cujo perfil foi criado
            // no banco de dados, mas a conta de autenticação não. Tentamos criar a conta (signUp) como fallback.
            if (authResponse.error && authResponse.error.message === 'Invalid login credentials') {
                console.warn('Login failed, attempting to sign up as a fallback for existing profile...');
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password: pass });

                if (signUpError) {
                    // Se o erro for "User already registered", significa que a conta de autenticação existe,
                    // então a senha original estava simplesmente errada. Re-lançamos o erro original.
                    if (signUpError.message.includes('already registered')) {
                        throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
                    }
                    // Se for outro erro durante o signUp, ele é mais relevante.
                    throw signUpError;
                }
                
                // Se o signUp funcionou, o usuário foi criado e logado (assumindo que a confirmação de email está desativada).
                // NOTA: Se a confirmação de email estiver ATIVADA no Supabase, o usuário precisará confirmar o email antes de poder logar.
                console.log('Fallback signUp successful. User auth account created.');
                authResponse = { data: signUpData, error: null };
            }
            
            // Se ainda houver erro ou não houver dados do usuário, lançamos a falha.
            if (authResponse.error || !authResponse.data.user) {
                throw new Error(authResponse.error?.message || "Email ou senha inválidos. Verifique suas credenciais.");
            }

            const authData = authResponse.data;

            // Etapa 2: Buscar o perfil do usuário via RPC para evitar recursão de RLS.
            const allUsers = await getUsers();
            let profile = allUsers.find(u => u.id === authData.user!.id);
            
            // Etapa 3: Se não houver perfil (caso raro agora), criar um via RPC.
            if (!profile) {
                console.warn("Perfil de usuário não encontrado, criando um novo...");
                const defaultRole = expectedRoleType === 'staff' ? 'Secretário(a)' : 'Pai/Responsável';
                const newProfileData = {
                    email: authData.user.email!,
                    name: authData.user.email?.split('@')[0] || 'Novo Usuário',
                    role: defaultRole as UserRoleName,
                    status: 'Ativo' as UserStatus,
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // MOCK: Default school ID.
                    avatar_url: `https://picsum.photos/seed/${authData.user.id}/100/100`
                };
                const createdProfile = await addUser(newProfileData);
                if (!createdProfile) throw new Error(`Falha ao criar o perfil do usuário.`);
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