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
            if (role === 'Diretor(a)' || role === 'Admin') return 'Admin';
            if (role === 'Secretário(a)') return 'Secretário(a)';
            if (role === 'Coordenador(a)') return 'Coordenador(a)';
            return 'Coordenador(a)'; 
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    const { user } = session;
                    
                    const profileResult = await api.getAuthenticatedUserProfile();

                    if (profileResult && typeof profileResult === 'object') {
                        // Case 1: RPC returned a full staff profile object (ideal case).
                        const staffProfile = profileResult;
                        setAuthError(null);
                        const profile: User = {
                            id: user.id,
                            email: user.email!,
                            name: staffProfile.name,
                            avatarUrl: staffProfile.avatarUrl || `https://picsum.photos/seed/user${user.id}/100/100`,
                            role: staffRoleToUserRole(staffProfile.role),
                            status: staffProfile.status === StaffStatus.Active ? UserStatus.Active : UserStatus.Inactive,
                            studentId: undefined,
                            school_id: staffProfile.school_id,
                        };
                        setCurrentUser(profile);
                    } else if (profileResult && typeof profileResult === 'string') {
                        // Case 2: RPC returned just a role string. Fallback to user/app metadata.
                        const roleName = profileResult;
                        const { user_metadata, app_metadata } = user;

                        // Try to find school_id in user_metadata first, then in app_metadata
                        const schoolId = user_metadata?.school_id || app_metadata?.school_id;

                        if (!schoolId) {
                            const errorMsg = `Erro de autenticação: 'school_id' ausente nos metadados do usuário. Este é um campo obrigatório para carregar o perfil.`;
                            console.error(errorMsg, "Causa provável: O usuário foi criado sem os metadados necessários ('school_id') em 'user_metadata' ou 'app_metadata' no Supabase Auth.");
                            setAuthError(errorMsg);
                            await supabase.auth.signOut();
                        } else {
                            setAuthError(null);
                            const profile: User = {
                                id: user.id,
                                email: user.email!,
                                name: user_metadata.full_name || user_metadata.name || user.email,
                                avatarUrl: user_metadata.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                                role: staffRoleToUserRole(roleName),
                                status: UserStatus.Active,
                                studentId: undefined,
                                school_id: schoolId,
                            };
                            setCurrentUser(profile);
                        }
                    } else {
                        // Case 3: RPC failed or returned nothing.
                        const errorMsg = `Erro de autenticação: Não foi possível carregar o perfil do funcionário. O acesso não é permitido.`;
                        console.error(errorMsg, "Causa provável: A função RPC 'get_my_role' falhou ou o usuário não tem um perfil de funcionário correspondente.");
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