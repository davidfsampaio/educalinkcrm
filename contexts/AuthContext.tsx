import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    currentUser: User | null;
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
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profile) {
                    setCurrentUser(profile as User);
                } else {
                    // This can happen if the profile was deleted but the session remains.
                    // The self-healing logic in performLogin will handle this on the next login.
                    await supabase.auth.signOut();
                }
            }
            setAuthLoading(false);
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            // On sign out, always clear the user
            if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                return;
            }

            // On sign in or token refresh, if we have a session and a user...
            if (session?.user) {
                // ...try to fetch the profile.
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                // IMPORTANT: Only update the current user if a profile was successfully found.
                // Do NOT set currentUser to null if the profile fetch fails, as `performLogin` might be in the middle of creating it.
                // The only event that should nullify the user is 'SIGNED_OUT'.
                if (profile) {
                    setCurrentUser(profile as User);
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setAuthLoading(true);

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            // 2. Fetch the user profile.
            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            // 3. Self-Healing Logic: If profile is not found, create it.
            if (!profile && (profileError?.code === 'PGRST116' || profileError === null)) {
                console.warn("Perfil não encontrado, tentando criar um novo automaticamente...");

                // Determine a safe default role based on the login portal
                const defaultRole = expectedRoleType === 'staff'
                    ? (email === 'admin@educalink.com' ? 'Admin' : 'Secretário(a)')
                    : 'Pai/Responsável';

                const defaultProfileData = {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: authData.user.email?.split('@')[0] || 'Novo Usuário',
                    role: defaultRole as UserRoleName,
                    status: 'Ativo' as UserStatus, // Corrected type
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // Default school ID
                    avatar_url: `https://picsum.photos/seed/${authData.user.id}/100/100`
                };
                
                // Create and select the new profile in a single call
                const { data: newProfile, error: insertError } = await supabase
                    .from('users')
                    .insert(defaultProfileData)
                    .select()
                    .single();

                if (insertError || !newProfile) {
                    console.error("Falha ao criar o perfil automaticamente:", insertError);
                    throw new Error("Falha ao criar o perfil do usuário automaticamente. Contate o suporte.");
                }

                console.log("Perfil criado com sucesso, continuando o login...");
                profile = newProfile;
            } else if (profileError) {
                 throw new Error(`Acesso negado ao perfil: ${profileError.message}`);
            }

            if (!profile) {
                throw new Error("Perfil de usuário não encontrado. Entre em contato com o suporte.");
            }

            // 4. Verify the role against the login portal
            const userIsParent = profile.role === 'Pai/Responsável';

            if (expectedRoleType === 'staff' && userIsParent) {
                throw new Error("Acesso negado. Este login é para a equipe da escola.");
            }
            
            if (expectedRoleType === 'parent' && !userIsParent) {
                throw new Error("Acesso negado. Este login é exclusivo para Pais e Responsáveis.");
            }

            // 5. Success! Set the current user.
            setCurrentUser(profile as User);

        } catch (error: any) {
            // FIX: Only set the error message. Do not sign out or clear the user,
            // as this causes the login loop. The user should see the error on the login screen.
            setAuthError(error.message);
        } finally {
            setAuthLoading(false);
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

    const value = { currentUser, hasPermission, authError, setAuthError, signInAsStaff, signInAsParent };

    if (authLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Verificando sessão...</p>
            </div>
        );
    }

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