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

                    const isAdmin = user.email === 'admin@educalink.com' || user.email === 'david.fsampaio@gmail.com';
                    const needsCorrection = isAdmin && (!user_metadata.schoolId || user_metadata.schoolId === 'school-123' || !user_metadata.role);

                    if (needsCorrection && event !== 'USER_UPDATED') {
                        // If correction is needed and this isn't the event triggered by our fix,
                        // we start the process but don't finalize the state yet.
                        setAuthLoading(true);
                        console.log("User metadata needs correction. Initiating update and session refresh.");

                        const newMetadata: { [key: string]: any } = { ...user_metadata };
                        if (!user_metadata.role) newMetadata.role = 'Admin';
                        if (!user_metadata.schoolId || user_metadata.schoolId === 'school-123') {
                            newMetadata.schoolId = '123e4567-e89b-12d3-a456-426614174000';
                        }

                        const { error: updateUserError } = await supabase.auth.updateUser({ data: newMetadata });
                        if (updateUserError) throw updateUserError;

                        // After updating, we must refresh the session to get a new JWT.
                        // This will trigger this onAuthStateChange listener again with USER_UPDATED event.
                        const { error: refreshError } = await supabase.auth.refreshSession();
                        if (refreshError) throw refreshError;

                        // We return here and wait for the auth event from refreshSession.
                        // The UI will keep showing "Carregando sistema...".
                        return;
                    } else {
                        // Metadata is correct (or this is the USER_UPDATED event with fresh data),
                        // so we can build the user profile.
                        const role: UserRoleName | undefined = user_metadata?.role;
                        const schoolId: string | undefined = user_metadata?.schoolId;

                        if (role && schoolId && schoolId !== 'school-123') {
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
                            setAuthLoading(false); // Final state, stop loading.
                        } else {
                            // This case handles users who are not admin and have missing metadata.
                            throw new Error(`Os metadados do usuário (role ou schoolId) estão ausentes ou inválidos.`);
                        }
                    }
                } else {
                    // No session, user is logged out.
                    setCurrentUser(null);
                    setAuthLoading(false); // Final state, stop loading.
                }
            } catch (error: any) {
                const errorMessage = `Erro de autenticação: ${error.message}`;
                console.error(errorMessage);
                setAuthError(errorMessage);
                setCurrentUser(null);
                setAuthLoading(false); // Final state on error, stop loading.
                // Log the user out to be safe and clear any bad state.
                await supabase.auth.signOut();
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });
        
        // Initial check on component mount to trigger the process.
        // The listener will handle the session if it exists.
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