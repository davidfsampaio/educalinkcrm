import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { Staff } from '../types';
import EditStaffModal from './staff/EditStaffModal';
import ProtectedComponent from './common/ProtectedComponent';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const Staff: React.FC = () => {
    const { staff: initialStaff, loading } = useData();
    const [localStaff, setLocalStaff] = useState<Staff[]>([]);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            setLocalStaff(initialStaff);
        }
    }, [initialStaff, loading]);

    const handleOpenEditModal = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setEditModalOpen(true);
    };

    const handleUpdateStaff = (updatedStaff: Staff) => {
        setLocalStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
        setEditModalOpen(false);
        setEditingStaff(null);
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Lista de Funcionários</h2>
                    <ProtectedComponent requiredPermission='create_staff'>
                        <button
                            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Adicionar Funcionário
                        </button>
                    </ProtectedComponent>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-brand-text-dark">
                            {localStaff.map((staffMember) => (
                                <tr key={staffMember.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{staffMember.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{staffMember.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{staffMember.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{staffMember.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProtectedComponent requiredPermission='edit_staff'>
                                            <button 
                                                onClick={() => handleOpenEditModal(staffMember)}
                                                className="text-brand-primary hover:text-sky-700"
                                            >
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                        </ProtectedComponent>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {editingStaff && (
                <EditStaffModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    staffMember={editingStaff}
                    onUpdateStaff={handleUpdateStaff}
                />
            )}
        </>
    );
};

export default Staff;