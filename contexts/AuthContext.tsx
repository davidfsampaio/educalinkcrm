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

    // This single useEffect handles all auth state changes, including the initial session check on page load.
    // It is the single source of truth for the user's authentication state.
    useEffect(() => {
        setAuthLoading(true);

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                // If a session exists, fetch the user profile from our 'users' table.
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                // Set the user only if the profile is found, otherwise set it to null.
                // This handles cases where an auth user exists but their profile in our table does not.
                setCurrentUser(profile as User | null);
            } else {
                // If there is no session (e.g., logged out), ensure the user is null.
                setCurrentUser(null);
            }
            // Once the check is complete (either found a user, or confirmed no session), stop loading.
            setAuthLoading(false);
        });

        return () => {
            // Clean up the listener when the component unmounts.
            authListener.subscription.unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount.

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setAuthLoading(true);

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            // 2. Fetch the user profile. The onAuthStateChange listener will also do this, but
            // we do it here to perform immediate validation and self-healing.
            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            // 3. Self-Healing Logic: If profile is not found, create it.
            if (!profile && (profileError?.code === 'PGRST116' || profileError === null)) {
                console.warn("Perfil não encontrado, tentando criar um novo automaticamente...");

                const defaultRole = expectedRoleType === 'staff'
                    ? (email === 'admin@educalink.com' ? 'Admin' : 'Secretário(a)')
                    : 'Pai/Responsável';

                const defaultProfileData = {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: authData.user.email?.split('@')[0] || 'Novo Usuário',
                    role: defaultRole as UserRoleName,
                    status: 'Ativo' as UserStatus,
                    school_id: '123e4567-e89b-12d3-a456-426614174000', // Default school ID
                    avatar_url: `https://picsum.photos/seed/${authData.user.id}/100/100`
                };
                
                const { data: newProfile, error: insertError } = await supabase
                    .from('users')
                    .insert(defaultProfileData)
                    .select()
                    .single();

                if (insertError || !newProfile) {
                    throw new Error("Falha ao criar o perfil do usuário automaticamente. Contate o suporte.");
                }
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

            // 5. Success! The onAuthStateChange listener will handle setting the state.
            // We just need to stop the loading indicator.
            
        } catch (error: any) {
            // If the error indicates a role mismatch, we must sign the user out
            // because they successfully authenticated but are in the wrong portal.
            if (error.message.includes("Acesso negado.")) {
                await supabase.auth.signOut();
            }
            setAuthError(error.message);
        } finally {
            // The listener will also set this, but we set it here to be safe.
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