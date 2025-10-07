import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { Staff as StaffType, StaffStatus } from '../types';
import EditStaffModal from './staff/EditStaffModal';
import ProtectedComponent from './common/ProtectedComponent';
import AddStaffModal from './staff/AddStaffModal';
import { useSettings } from '../contexts/SettingsContext';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

interface StaffProps {
    initialStaff?: StaffType | null;
}

const Staff: React.FC<StaffProps> = ({ initialStaff }) => {
    const { staff, addStaff, updateStaff } = useData();
    const { settings } = useSettings();
    const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (initialStaff) {
            const staffToSelect = staff.find(s => s.id === initialStaff.id);
            if (staffToSelect) {
                handleOpenEditModal(staffToSelect);
            }
        }
    }, [initialStaff, staff]);


    const handleOpenEditModal = (staffMember: StaffType) => {
        setEditingStaff(staffMember);
        setEditModalOpen(true);
    };

    const handleUpdateStaff = (updatedStaff: StaffType) => {
        updateStaff(updatedStaff);
        setEditModalOpen(false);
        setEditingStaff(null);
    };

    const handleAddStaff = (newStaffData: Omit<StaffType, 'id' | 'status' | 'hireDate' | 'avatarUrl'>) => {
        addStaff(newStaffData);
        setAddModalOpen(false);
    };

    const filteredStaff = useMemo(() => {
        return staff.filter(staffMember => {
            const roleMatch = roleFilter === 'all' || staffMember.role === roleFilter;
            const statusMatch = statusFilter === 'all' || staffMember.status === statusFilter;
            return roleMatch && statusMatch;
        });
    }, [staff, roleFilter, statusFilter]);

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Lista de Funcionários</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="all">Todos os Cargos</option>
                            {settings.staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="all">Todos os Status</option>
                            {Object.values(StaffStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ProtectedComponent requiredPermission='create_staff'>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Adicionar Funcionário
                            </button>
                        </ProtectedComponent>
                    </div>
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
                            {filteredStaff.map((staffMember) => (
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

            <AddStaffModal 
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddStaff={handleAddStaff}
            />

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