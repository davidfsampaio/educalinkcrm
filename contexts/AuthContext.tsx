import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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

        // 1. Check for an existing session when the component mounts.
        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && isMounted) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profile && isMounted) {
                        setCurrentUser(profile as User);
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

        // 2. Set up a listener ONLY for SIGNED_OUT events.
        // SIGNED_IN is handled exclusively by the performLogin function.
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
            // Step 1: Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            // Step 2: Fetch the user's profile from the 'users' table.
            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            // Step 3: If no profile exists (common for new users), create one.
            if (!profile && profileError?.code === 'PGRST116') {
                console.warn("Perfil de usuário não encontrado, criando um novo...");

                const defaultRole = expectedRoleType === 'staff'
                    ? (email === 'admin@educalink.com' ? 'Admin' : 'Secretário(a)')
                    : 'Pai/Responsável';

                const newProfileData = {
                    id: authData.user.id,
                    email: authData.user.email!,
                    name: authData.user.email?.split('@')[0] || 'Novo Usuário',
                    role: defaultRole as UserRoleName,
                    status: 'Ativo' as UserStatus,
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // MOCK: Default school ID.
                    avatar_url: `https://picsum.photos/seed/${authData.user.id}/100/100`
                };
                
                const { data: createdProfile, error: insertError } = await supabase
                    .from('users')
                    .insert(newProfileData)
                    .select()
                    .single();

                if (insertError || !createdProfile) {
                    throw new Error(`Falha ao criar o perfil do usuário: ${insertError?.message || 'Erro desconhecido'}`);
                }
                profile = createdProfile;
            } else if (profileError) {
                 throw new Error(`Erro ao acessar o perfil: ${profileError.message}`);
            }

            if (!profile) {
                throw new Error("Perfil de usuário não pôde ser encontrado ou criado. Contate o suporte.");
            }

            // Step 4: Verify the user is logging into the correct portal (Staff vs. Parent).
            const isParentRole = profile.role === 'Pai/Responsável';

            if (expectedRoleType === 'staff' && isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal de pais/responsáveis.");
            }
            
            if (expectedRoleType === 'parent' && !isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal da equipe da escola.");
            }

            // Step 5: Success! Set the current user. This is the definitive action that completes the login.
            setCurrentUser(profile as User);
            
        } catch (error: any) {
            // On any failure, ensure the user is signed out and show an error.
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAuthError(error.message);
            // Re-throw the error so the UI can handle its local loading state.
            throw error;
        }
    };

    const signInAsStaff = async (email: string, pass: string) => {
        try {
            await performLogin(email, pass, 'staff');
        } catch (error) {
            // Error is already set in context by performLogin.
            // We just catch it here to prevent an unhandled promise rejection in the UI form.
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
