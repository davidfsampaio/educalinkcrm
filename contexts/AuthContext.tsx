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
            return 'Coordenador(a)'; 
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    const { user } = session;
                    
                    // Use an RPC call to avoid RLS recursion issues on direct table selects.
                    const staffProfile = await api.getUserProfileRpc();

                    if (staffProfile) {
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
                        const errorMsg = `Erro de autenticação: Não foi possível carregar o perfil do funcionário. O acesso não é permitido.`;
                        console.error(errorMsg, "Causa provável: O usuário não possui um perfil de funcionário correspondente ou a função RPC 'get_user_profile' não foi encontrada/falhou no backend.");
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