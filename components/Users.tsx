import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { User, UserStatus } from '../types';
import AddUserModal from './users/AddUserModal';
import EditUserModal from './users/EditUserModal';
import ProtectedComponent from './common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const getStatusClass = (status: UserStatus) => {
    switch(status) {
        case UserStatus.Active: return 'bg-green-100 text-green-800';
        case UserStatus.Inactive: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Users: React.FC = () => {
    const { users: initialUsers, students, loading } = useData();
    const [localUsers, setLocalUsers] = useState<User[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        if (!loading) {
            setLocalUsers(initialUsers);
        }
    }, [initialUsers, loading]);

    const handleAddUser = (newUserData: Omit<User, 'id' | 'avatarUrl' | 'status'>) => {
        const newUser: User = {
            id: Date.now(), // Mock ID
            ...newUserData,
            status: UserStatus.Active,
            avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`,
        };
        setLocalUsers(prev => [newUser, ...prev]);
        setAddModalOpen(false);
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setLocalUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            setLocalUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Lista de Usuários</h2>
                    <ProtectedComponent requiredPermission='manage_users'>
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Usuário
                        </button>
                    </ProtectedComponent>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {localUsers.map((user) => {
                                const student = user.studentId ? students.find(s => s.id === user.studentId) : null;
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full mr-4" src={user.avatarUrl} alt={user.name} />
                                            <div className="font-medium text-brand-text-dark">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-brand-text-dark">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-brand-text-dark">
                                        {user.role}
                                        {student && (
                                            <span className="block text-xs text-slate-500">
                                                Responsável por: {student.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <ProtectedComponent requiredPermission='manage_users'>
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => setEditingUser(user)} className="text-brand-primary hover:text-sky-700" title="Editar">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700" title="Excluir">
                                                    <Trash2Icon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </ProtectedComponent>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddUser={handleAddUser}
            />
            
            {editingUser && (
                <EditUserModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    onUpdateUser={handleUpdateUser}
                />
            )}
        </>
    );
};

export default Users;