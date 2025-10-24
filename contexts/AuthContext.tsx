import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { getUsers, deleteUser as apiDeleteUser } from '../services/apiService';

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
            let profile: User | undefined;

            // Etapa 1: Tentar fazer login
            const signInResponse = await supabase.auth.signInWithPassword({ email, password: pass });

            // Etapa 2: Se o login falhar, tentar a autocorreção
            if (signInResponse.error) {
                if (signInResponse.error.message === 'Invalid login credentials') {
                    console.warn('Login failed, attempting autocorrection for existing profile...');

                    const allUsers = await getUsers();
                    const existingProfile = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

                    if (existingProfile) {
                        console.log('Found existing profile without auth user. Attempting recovery by recreating auth user.');

                        const { id: oldId, ...profileDataToRestore } = existingProfile;

                        // Primeiro, exclua o perfil conflitante da tabela public.users.
                        await apiDeleteUser(oldId);

                        // Agora, crie o usuário de autenticação. O gatilho do DB será executado e recriará o perfil.
                        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                            email,
                            password: pass,
                            options: {
                                data: {
                                    ...profileDataToRestore
                                }
                            }
                        });

                        if (signUpError) {
                            console.error("Recovery failed during signUp:", signUpError);
                            throw signUpError; // Propaga o erro (ex: "Database error saving new user")
                        }
                        
                        console.log('Recovery successful. Auth account created and profile linked.');
                        authResponse = { data: signUpData, error: null };
                        profile = undefined; // Força uma nova busca abaixo para obter o perfil recém-criado com o ID correto.
                    } else {
                        throw new Error("Email ou senha inválidos.");
                    }
                } else {
                    throw signInResponse.error;
                }
            } else {
                authResponse = signInResponse;
            }
            
            if (!authResponse.data.user) {
                throw new Error("Falha na autenticação. Usuário não encontrado.");
            }
            
            // Etapa 3: Garantir que temos o perfil
            if (!profile) {
                const allUsers = await getUsers();
                profile = allUsers.find(u => u.id === authResponse.data.user!.id);
            }
            
            if (!profile) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const refetchedUsers = await getUsers();
                profile = refetchedUsers.find(u => u.id === authResponse.data.user!.id);
                if (!profile) {
                    throw new Error(`Falha ao carregar o perfil do usuário após o login. A sincronização pode estar atrasada. Tente novamente em alguns instantes.`);
                }
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
            setCurrentUser(profile);
            
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
