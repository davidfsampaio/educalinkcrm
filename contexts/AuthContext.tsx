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
        const handleAuthStateChange = async (event: string, session: any) => {
            console.log(`Auth event: ${event}`);

            try {
                if (session?.user) {
                    const { user } = session;
                    const { user_metadata } = user;

                    // Auto-correction logic for admin metadata
                    const isAdmin = user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com';
                    const needsRoleUpdate = isAdmin && !user_metadata.role;
                    const needsSchoolUpdate = isAdmin && (!user_metadata.schoolId || user_metadata.schoolId === 'school-123');

                    if (needsRoleUpdate || needsSchoolUpdate) {
                        setAuthLoading(true);
                        console.log("Metadata missing or invalid, attempting synchronous auto-correction...");
                        
                        const newMetadata: { [key: string]: any } = { ...user_metadata };
                        if (needsRoleUpdate) newMetadata.role = 'Admin';
                        if (needsSchoolUpdate) newMetadata.schoolId = '123e4567-e89b-12d3-a456-426614174000';

                        // Use the direct response from updateUser to avoid race conditions
                        const { data: updateData, error: updateUserError } = await supabase.auth.updateUser({ data: newMetadata });

                        if (updateUserError) {
                            throw new Error(`Falha ao auto-corrigir metadados do usuário: ${updateUserError.message}`);
                        }

                        if (updateData.user) {
                            const updatedUser = updateData.user;
                            const { user_metadata: updatedMetadata } = updatedUser;
                            
                            const role: UserRoleName | undefined = updatedMetadata?.role;
                            const schoolId: string | undefined = updatedMetadata?.schoolId;

                            if (role && schoolId && schoolId !== 'school-123') {
                                console.log("Correction successful. Manually setting user profile from updateUser response.");
                                const profile: User = {
                                    id: updatedUser.id,
                                    email: updatedUser.email!,
                                    name: updatedMetadata?.name || updatedUser.email!,
                                    avatarUrl: updatedMetadata?.avatarUrl || `https://picsum.photos/seed/user${updatedUser.id}/100/100`,
                                    role: role,
                                    status: UserStatus.Active,
                                    studentId: updatedMetadata?.studentId,
                                    schoolId: schoolId,
                                };
                                setCurrentUser(profile);
                                setAuthError(null);
                                setAuthLoading(false); // We can stop loading now
                                return; // Exit handler since we've manually processed the update
                            } else {
                                throw new Error("A correção falhou em retornar os metadados atualizados.");
                            }
                        } else {
                            throw new Error("A chamada de atualização do usuário não retornou um objeto de usuário.");
                        }
                    } else {
                        // No correction needed, proceed normally
                        const role: UserRoleName | undefined = user_metadata?.role;
                        const schoolId: string | undefined = user_metadata?.schoolId;

                        if (role && schoolId) {
                            console.log("Valid session found. Setting user profile.");
                            const profile: User = {
                                id: user.id,
                                email: user.email!,
                                name: user_metadata?.name || user.email!,
                                avatarUrl: user_metadata?.avatarUrl || `https://picsum.photos/seed/user${user.id}/100/100`,
                                role: role,
                                status: UserStatus.Active,
                                studentId: user_metadata?.studentId,
                                schoolId: schoolId,
                            };
                            setCurrentUser(profile);
                            setAuthError(null);
                        } else {
                            let missingFields = [];
                            if (!role) missingFields.push("'role'");
                            if (!schoolId) missingFields.push("'schoolId'");
                            throw new Error(`Os metadados do usuário (${missingFields.join(' e ')}) não foram encontrados. Acesso não permitido.`);
                        }
                    }
                } else {
                    // Handles logout or initial state with no user
                    console.log("No active session. Clearing user.");
                    setCurrentUser(null);
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                console.error(errorMessage);
                setAuthError(errorMessage);
                setCurrentUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });
        
        // Initial check on component mount to trigger the process
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setAuthLoading(false);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount
    
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
