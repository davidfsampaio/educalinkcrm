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
            // Se o usuário for atualizado, a sessão pode ficar nula temporariamente. Aguardamos o próximo evento SIGNED_IN.
            if (event === 'USER_UPDATED' && session === null) {
                return;
            }

            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata } = user;

                    // --- Lógica de autocorreção para metadados de administrador ---
                    const isAdmin = user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com';
                    const needsRoleUpdate = isAdmin && !user_metadata.role;
                    const needsSchoolUpdate = isAdmin && !user_metadata.school_id;

                    if (needsRoleUpdate || needsSchoolUpdate) {
                        const newMetadata: { [key: string]: any } = { ...user_metadata };
                        if (needsRoleUpdate) newMetadata.role = 'Admin';
                        if (needsSchoolUpdate) newMetadata.school_id = 'school-123'; // ID da escola padrão para admin

                        const { error: updateUserError } = await supabase.auth.updateUser({ data: newMetadata });
                        
                        if (updateUserError) {
                            throw new Error(`Falha ao autoc-corrigir metadados do usuário: ${updateUserError.message}`);
                        }
                        
                        // A chamada updateUser irá disparar outro evento onAuthStateChange com a sessão atualizada.
                        // Podemos retornar aqui para que o próximo evento lide com a renderização, evitando um piscar de tela com dados antigos.
                        setAuthLoading(true); // Mantém o estado de carregamento até a sessão correta chegar.
                        return;
                    }
                    // --- Fim da lógica de autocorreção ---

                    // Constrói o perfil a partir dos metadados da sessão existente
                    const role: UserRoleName | undefined = user_metadata?.role;
                    const schoolId: string | undefined = user_metadata?.school_id;

                    if (role && schoolId) {
                        const profile: User = {
                            id: user.id,
                            email: user.email!,
                            name: user_metadata?.full_name || user_metadata?.name || user.email!,
                            avatarUrl: user_metadata?.avatar_url || `https://picsum.photos/seed/user${user.id}/100/100`,
                            role: role,
                            status: UserStatus.Active,
                            studentId: user_metadata?.student_id,
                            school_id: schoolId,
                        };
                        setCurrentUser(profile);
                        setAuthError(null);
                    } else {
                        let missingFields = [];
                        if (!role) missingFields.push("'role'");
                        if (!schoolId) missingFields.push("'school_id'");
                        throw new Error(`A 'carga' (${missingFields.join(' e ')}) do usuário não foi encontrada nos metadados. Acesso não permitido.`);
                    }
                } else {
                    // Lida com logout ou estado inicial sem usuário
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                const actionMessage = "Ação necessária: Verifique os 'user_metadata' do usuário no painel do Supabase Auth.";
                console.error(errorMessage, actionMessage);
                setAuthError(`${errorMessage}\n${actionMessage}`);
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
