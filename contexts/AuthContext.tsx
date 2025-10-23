import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';

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

    const handleAuthentication = async (session: any, expectedRoleType?: 'staff' | 'parent') => {
        try {
            if (!session?.user) {
                setCurrentUser(null);
                return;
            }

            const { user } = session;
            
            // Source of Truth: Fetch the user profile from the public.users table
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                // This is the critical point. If no profile, the login is invalid.
                throw new Error(`Perfil de usuário não encontrado. Entre em contato com o suporte.`);
            }
            
            // Role validation: Check if the user's role matches the portal they're trying to log into.
            const userIsParent = profile.role === 'Pai/Responsável';
            
            if (expectedRoleType === 'staff' && userIsParent) {
                throw new Error("Acesso negado. Este login é para a equipe da escola.");
            }
            if (expectedRoleType === 'parent' && !userIsParent) {
                throw new Error("Acesso negado. Este login é exclusivo para Pais e Responsáveis.");
            }
            
            // If all checks pass, set the current user
            setCurrentUser(profile as User);
            setAuthError(null);

        } catch (error: any) {
            const errorMessage = error.message.includes("Invalid login credentials") 
                ? "Email ou senha inválidos." 
                : error.message;
            
            console.error(`Erro de autenticação: ${errorMessage}`);
            setAuthError(errorMessage);
            setCurrentUser(null);
            // Log the user out to be safe and clear any bad state.
            await supabase.auth.signOut();
        } finally {
            setAuthLoading(false);
        }
    };

    // Centralized sign-in functions
    const signInAsStaff = async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            setAuthError("Email ou senha inválidos.");
            return;
        }
        if (data.session) {
            await handleAuthentication(data.session, 'staff');
        }
    };
    
    const signInAsParent = async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
         if (error) {
            setAuthError("Email ou senha inválidos. Verifique suas credenciais.");
            return;
        }
        if (data.session) {
            await handleAuthentication(data.session, 'parent');
        }
    };

    // This listener handles session restoration and logout events.
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // If the event is SIGNED_OUT, clear the user and exit.
            if (_event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setAuthError(null);
                setAuthLoading(false);
                return;
            }
            // If there's a session (e.g., from page refresh), validate it without an expected role.
            if (_event === 'INITIAL_SESSION' && session) {
                 await handleAuthentication(session);
            }
        });
        
        // Initial check when the app loads
        supabase.auth.getSession().then(async ({ data: { session } }) => {
             await handleAuthentication(session);
             setAuthLoading(false);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);
    
    const userPermissions = useMemo((): Set<Permission> => {
        if (!currentUser || !settings.roles) {
            return new Set();
        }
        const role = settings.roles.find(r => r.name === currentUser.role);
        return new Set(role ? role.permissions : []);
    }, [currentUser, settings.roles]);

    const hasPermission = (permission: Permission): boolean => {
        return userPermissions.has(permission);
    };

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