import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { User, Permission, UserRoleName, UserStatus, StaffStatus } from '../types';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';
import * as api from '../services/apiService';


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

        const staffRoleToUserRole = (role: string): UserRoleName => {
            if (role === 'Diretor(a)') return 'Admin';
            if (role === 'Secretário(a)') return 'Secretário(a)';
            if (role === 'Coordenador(a)') return 'Coordenador(a)';
            // Default fallback role if something unexpected is returned
            return 'Coordenador(a)'; 
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    const { user } = session;
                    
                    // Use the RPC call suggested by the database error hint to avoid RLS issues.
                    const staffProfile = await api.getAuthenticatedUserProfile();

                    if (staffProfile && typeof staffProfile === 'object') {
                        setAuthError(null);
                        const profile: User = {
                            id: user.id, // Use the auth user ID
                            email: user.email!, // Use the auth user email
                            name: staffProfile.name,
                            avatarUrl: staffProfile.avatarUrl || `https://picsum.photos/seed/user${user.id}/100/100`,
                            role: staffRoleToUserRole(staffProfile.role),
                            status: staffProfile.status === StaffStatus.Active ? UserStatus.Active : UserStatus.Inactive,
                            studentId: undefined, // It's a staff member
                            school_id: staffProfile.school_id,
                        };
                        setCurrentUser(profile);
                    } else {
                        // This case handles when the RPC call succeeds but returns no profile,
                        // or returns something other than an object (like just the role as a string).
                        const errorMsg = `Erro de autenticação: Perfil de funcionário não encontrado ou inválido. O acesso não é permitido.`;
                        console.error(errorMsg, "Causa provável: O usuário autenticado não tem um perfil correspondente na tabela 'staff' ou a função 'get_my_role' não retornou os dados esperados.");
                        setAuthError(errorMsg);
                        await supabase.auth.signOut();
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Erro ao processar a mudança de estado de autenticação:", error);
                setAuthError("Ocorreu um erro inesperado durante a autenticação.");
                setCurrentUser(null);
            } finally {
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