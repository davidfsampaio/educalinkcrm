import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Permission } from '../../types';

interface ProtectedComponentProps {
    requiredPermission: Permission;
    children: React.ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ requiredPermission, children }) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(requiredPermission)) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedComponent;
