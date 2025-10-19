import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    currentUser: User | null;
    hasPermission: (permission: Permission) => boolean;
    authError: string | null;
    setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        setAuthLoading(true);

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata, app_metadata } = user;

                    // Build profile exclusively from metadata, removing the problematic RPC call.
                    // This is the standard approach and avoids RLS recursion issues.
                    const role: UserRoleName | undefined = user_metadata?.role || app_metadata?.role;
                    let schoolId: string | undefined = user_metadata?.school_id || app_metadata?.school_id;

                    if (!role) {
                        const errorMsg = "Erro de autenticação: O 'cargo' (role) do usuário não foi encontrado nos metadados. Acesso não permitido.";
                        console.error(errorMsg, "Ação necessária: Configure o campo 'role' nos metadados do usuário no Supabase Auth.");
                        setAuthError(errorMsg);
                        await supabase.auth.signOut();
                        return; // Stop processing
                    }

                    // Maintain the fallback for the Admin user if school_id is missing, but log a clear warning.
                    if (!schoolId && role === 'Admin') {
                        console.warn("school_id não encontrado para o Admin. Aplicando fallback 'school-123'. Para uma solução permanente, configure 'school_id' nos metadados do usuário no Supabase Auth.");
                        schoolId = 'school-123';
                    }

                    if (!schoolId) {
                        const errorMsg = "Erro de autenticação: O 'ID da escola' (school_id) não foi encontrado nos metadados. Acesso não permitido.";
                        console.error(errorMsg, "Ação necessária: Configure o campo 'school_id' nos metadados do usuário no Supabase Auth.");
                        setAuthError(errorMsg);
                        await supabase.auth.signOut();
                        return; // Stop processing
                    }
                    
                    setAuthError(null);
                    const profile: User = {
                        id: user.id,
                        email: user.email!,
                        name: user_metadata?.full_name || user_metadata?.name || user.email!,
                        avatarUrl: user_metadata?.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                        role: role,
                        status: UserStatus.Active, // Assume active; can be managed in a separate 'profiles' table if needed
                        studentId: user_metadata?.student_id, // For parent roles
                        school_id: schoolId,
                    };
                    setCurrentUser(profile);

                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Erro ao processar a mudança de estado de autenticação:", error);
                setAuthError("Ocorreu um erro inesperado durante a autenticação.");
                setCurrentUser(null);
            } finally {
                // This will now always be called, fixing the stuck loading screen.
                setAuthLoading(false);
            }
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

    const value = { currentUser, hasPermission, authError, setAuthError };

    if (authLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Carregando sistema...</p>
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
