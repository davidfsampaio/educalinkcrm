
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { User, UserRoleName, UserStatus } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useData } from '../../contexts/DataContext';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
    const { settings } = useSettings();
    const { students, loading: studentsLoading } = useData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRoleName>('Secretário(a)');
    const [status, setStatus] = useState<UserStatus>(UserStatus.Active);
    const [linkedStudentId, setLinkedStudentId] = useState<number | ''>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setStatus(user.status);
            setLinkedStudentId(user.studentId || '');
        }
    }, [user]);

    const handleSubmit = () => {
        if (!name || !email) {
            setError('Nome e Email são obrigatórios.');
            return;
        }
        if (role === 'Pai/Responsável' && !linkedStudentId) {
            setError('Por favor, vincule um aluno para o perfil de Pai/Responsável.');
            return;
        }

        const updatedUser: User = {
            ...user,
            name,
            email,
            role,
            status,
            studentId: role === 'Pai/Responsável' ? linkedStudentId || undefined : undefined,
        };

        onUpdateUser(updatedUser);
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Usuário: ${user.name}`}>
             <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Cargo</label>
                    <select
                        value={role}
                        onChange={e => {
                            const newRole = e.target.value as UserRoleName;
                            setRole(newRole);
                            if (newRole !== 'Pai/Responsável') {
                                setLinkedStudentId('');
                            }
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                        {settings.roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                </div>
                 {role === 'Pai/Responsável' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aluno Vinculado</label>
                        <select
                            value={linkedStudentId}
                            onChange={e => setLinkedStudentId(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="">{studentsLoading ? 'Carregando...' : 'Selecione um aluno'}</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as UserStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                        {Object.values(UserStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditUserModal;
