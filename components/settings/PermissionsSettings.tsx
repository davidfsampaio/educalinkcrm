import React from 'react';
import { Settings, Role, Permission } from '../../types';
import { allPermissions } from '../../data/permissionsData';
import Card from '../common/Card';

interface PermissionsSettingsProps {
    localRoles: Role[];
    setLocalSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const PermissionsSettings: React.FC<PermissionsSettingsProps> = ({ localRoles, setLocalSettings }) => {

    const handlePermissionChange = (roleName: string, permission: Permission, isChecked: boolean) => {
        setLocalSettings(prev => {
            const newRoles = prev.roles.map(role => {
                if (role.name === roleName) {
                    const newPermissions = isChecked
                        ? [...role.permissions, permission]
                        : role.permissions.filter(p => p !== permission);
                    return { ...role, permissions: newPermissions };
                }
                return role;
            });
            return { ...prev, roles: newRoles };
        });
    };
    
    const permissionsByModule = allPermissions.reduce((acc, p) => {
        if (!acc[p.module]) {
            acc[p.module] = [];
        }
        acc[p.module].push(p);
        return acc;
    }, {} as Record<string, typeof allPermissions>);

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-text-dark">Gerenciar Permissões de Cargos</h2>
            <p className="text-brand-text-light mb-6">Defina o que cada cargo de usuário pode ver e fazer no sistema.</p>
            <div className="space-y-6">
                {localRoles.map(role => (
                    <div key={role.name} className="border border-slate-200/80 rounded-lg">
                        <h3 className="text-lg font-semibold bg-slate-100 p-4 border-b rounded-t-lg text-brand-text-dark">{role.name}</h3>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(permissionsByModule).map(([moduleName, permissions]) => (
                                <div key={moduleName}>
                                    <h4 className="font-bold text-brand-text-dark mb-2">{moduleName}</h4>
                                    <div className="space-y-2">
                                        {permissions.map(p => (
                                            <label key={p.name} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                    checked={role.permissions.includes(p.name)}
                                                    onChange={e => handlePermissionChange(role.name, p.name, e.target.checked)}
                                                    // Admin role cannot be changed
                                                    disabled={role.name === 'Admin'}
                                                />
                                                <span className="ml-3 text-sm text-brand-text">{p.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default PermissionsSettings;
