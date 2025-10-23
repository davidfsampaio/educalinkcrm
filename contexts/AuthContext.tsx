import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
        setIsLoading(true);

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setCurrentUser(null);
                setIsLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profile) {
                setCurrentUser(profile as User);
            }
            
            setIsLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const performLogin = async (email: string, pass: string, expectedRoleType: 'staff' | 'parent') => {
        setAuthError(null);
        setIsLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            
            if (authError || !authData.user) {
                throw new Error("Email ou senha inválidos. Verifique suas credenciais.");
            }

            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
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

            const userIsParent = profile.role === 'Pai/Responsável';

            if (expectedRoleType === 'staff' && userIsParent) {
                throw new Error("Acesso negado. Este login é para a equipe da escola.");
            }
            
            if (expectedRoleType === 'parent' && !userIsParent) {
                throw new Error("Acesso negado. Este login é exclusivo para Pais e Responsáveis.");
            }

            setCurrentUser(profile as User);
            
        } catch (error: any) {
            if (error.message.includes("Acesso negado.")) {
                await supabase.auth.signOut();
                // After signing out, the onAuthStateChange listener will set currentUser to null
            }
            setAuthError(error.message);
            // We need to set loading false here in case of an error, otherwise it gets stuck
            setIsLoading(false);
        } finally {
            // The listener will set loading to false on success.
            // We only need to handle the error case here explicitly.
            // No, the listener might race. Let's let the listener handle all loading=false states.
            // Let's remove the finally block.
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