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
        // On initial load, check for an existing session.
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
                // If a session exists, fetch the associated user profile.
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                // If the profile exists, set it as the current user.
                // If not, currentUser remains null, and the user will see the login page.
                setCurrentUser(profile ? (profile as User) : null);
            }
            // Once the session check is complete, we're done with initial loading.
            setIsLoading(false);
        });

        // Set up a listener for auth events. We only care about SIGNED_OUT
        // because the login flow is now handled entirely by `performLogin`.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                }
            }
        );

        // Cleanup the listener on component unmount.
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);

        try {
            // 1. Authenticate the user with Supabase Auth.
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            // 2. Fetch the user's profile from the 'users' table.
            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            // 3. If no profile exists (common for new users), create one.
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
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // MOCK: Default school ID. Should be dynamic in a multi-tenant app.
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

            // 4. Verify the user is logging into the correct portal (Staff vs. Parent).
            const isParentRole = profile.role === 'Pai/Responsável';

            if (expectedRoleType === 'staff' && isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal de pais/responsáveis.");
            }
            
            if (expectedRoleType === 'parent' && !isParentRole) {
                throw new Error("Acesso negado. Este usuário pertence ao portal da equipe da escola.");
            }

            // 5. Success! Set the current user.
            setCurrentUser(profile as User);
            
        } catch (error: any) {
            // On any failure, ensure the user is signed out and show an error.
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAuthError(error.message);
        } finally {
            // No matter what, stop the loading indicator.
            setIsLoading(false);
        }
    };

    const signInAsStaff = (email: string, pass: string) => performLogin(email, pass, 'staff');
    const signInAsParent = (email: string, pass: string) => performLogin(email, pass, 'parent');
    
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