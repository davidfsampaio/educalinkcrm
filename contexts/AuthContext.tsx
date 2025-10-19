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
            let isAutoCorrecting = false; // Flag to prevent premature loading state change

            // If the user is updated, the session can be null temporarily.
            // We let the next SIGNED_IN event handle the logic.
            if (event === 'USER_UPDATED' && session === null) {
                return;
            }

            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata } = user;

                    // Auto-correction logic for admin metadata
                    const isAdmin = user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com';
                    const needsRoleUpdate = isAdmin && !user_metadata.role;
                    const needsSchoolUpdate = isAdmin && !user_metadata.school_id;

                    if (needsRoleUpdate || needsSchoolUpdate) {
                        isAutoCorrecting = true; // Signal that we are performing a correction
                        const newMetadata: { [key: string]: any } = { ...user_metadata };
                        if (needsRoleUpdate) newMetadata.role = 'Admin';
                        if (needsSchoolUpdate) newMetadata.school_id = 'school-123'; // Default school ID for admin

                        const { error: updateUserError } = await supabase.auth.updateUser({ data: newMetadata });
                        
                        if (updateUserError) {
                            throw new Error(`Falha ao auto-corrigir metadados do usuário: ${updateUserError.message}`);
                        }
                        // After updating, we STOP here. The `updateUser` call will trigger
                        // a new onAuthStateChange event with the updated session, which we will process then.
                        // `isAutoCorrecting` is true, so the `finally` block won't set loading to false.
                    } else {
                        // If no correction was needed, proceed to build the user profile
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
                    }
                } else {
                    // Handles logout or initial state with no user
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                const actionMessage = "Ação necessária: Verifique os 'user_metadata' do usuário no painel do Supabase Auth.";
                console.error(errorMessage, actionMessage);
                setAuthError(`${errorMessage}\n${actionMessage}`);
                setCurrentUser(null);
            } finally {
                // Only stop loading if we are NOT waiting for an auto-correction refresh
                if (!isAutoCorrecting) {
                    setAuthLoading(false);
                }
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