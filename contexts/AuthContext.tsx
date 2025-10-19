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
    const [isAwaitingCorrection, setIsAwaitingCorrection] = useState(false);


    useEffect(() => {
        const handleAuthStateChange = async (event: string, session: any) => {
            console.log(`Auth event: ${event}`);

            // If a correction has been triggered, we wait for the USER_UPDATED event.
            if (isAwaitingCorrection && event !== 'USER_UPDATED') {
                console.log("Awaiting user update after correction...");
                return; 
            }

            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata } = user;

                    // Auto-correction logic for admin metadata
                    const isAdmin = user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com';
                    const needsRoleUpdate = isAdmin && !user_metadata.role;
                    const needsSchoolUpdate = isAdmin && (!user_metadata.school_id || user_metadata.school_id === 'school-123');

                    if ((needsRoleUpdate || needsSchoolUpdate) && !isAwaitingCorrection) {
                        setIsAwaitingCorrection(true);
                        setAuthLoading(true); // Keep loading screen on
                        console.log("Metadata missing or invalid, attempting auto-correction...");
                        
                        const newMetadata: { [key: string]: any } = { ...user_metadata };
                        if (needsRoleUpdate) newMetadata.role = 'Admin';
                        if (needsSchoolUpdate) newMetadata.school_id = '123e4567-e89b-12d3-a456-426614174000';

                        const { error: updateUserError } = await supabase.auth.updateUser({ data: newMetadata });
                        
                        if (updateUserError) {
                            throw new Error(`Falha ao auto-corrigir metadados do usuário: ${updateUserError.message}`);
                        }
                        
                        // After updating, we STOP. The `updateUser` call triggers a new onAuthStateChange event.
                        console.log("User update triggered. Waiting for new session...");
                        return;

                    } else {
                        // If no correction was needed OR if this is the event after correction
                        const role: UserRoleName | undefined = user_metadata?.role;
                        const schoolId: string | undefined = user_metadata?.school_id;

                        if (role && schoolId) {
                            console.log("Valid session found. Setting user profile.");
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
                            setIsAwaitingCorrection(false); // Correction is complete
                        } else {
                            let missingFields = [];
                            if (!role) missingFields.push("'role'");
                            if (!schoolId) missingFields.push("'school_id'");
                            throw new Error(`A 'carga' (${missingFields.join(' e ')}) do usuário não foi encontrada nos metadados. Acesso não permitido.`);
                        }
                    }
                } else {
                    // Handles logout or initial state with no user
                    console.log("No active session. Clearing user.");
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                const actionMessage = "Ação necessária: Verifique os 'user_metadata' do usuário no painel do Supabase Auth.";
                console.error(errorMessage, actionMessage);
                setAuthError(`${errorMessage}\n${actionMessage}`);
                setCurrentUser(null);
                setIsAwaitingCorrection(false);
            } finally {
                // Only stop loading if we are not waiting for a correction to complete.
                if (!isAwaitingCorrection) {
                    setAuthLoading(false);
                }
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });
        
        // Initial check on component mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setAuthLoading(false);
            }
        });


        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [isAwaitingCorrection]);
    
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
