
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';
// FIX: Corrected import path for types.
import { Staff, StaffStatus, StaffRole } from '../../types';

interface EditStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffMember: Staff;
    onUpdateStaff: (staff: Staff) => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ isOpen, onClose, staffMember, onUpdateStaff }) => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<StaffStatus>(StaffStatus.Active);
    const [error, setError] = useState('');

    useEffect(() => {
        if (staffMember) {
            setName(staffMember.name);
            setRole(staffMember.role);
            setEmail(staffMember.email);
            setPhone(staffMember.phone);
            setStatus(staffMember.status);
        }
    }, [staffMember]);

    const handleSubmit = () => {
        if (!name || !role || !email) {
            setError('Nome, Cargo e Email são obrigatórios.');
            return;
        }

        const updatedStaff: Staff = {
            ...staffMember,
            name,
            role,
            email,
            phone,
            status,
        };

        onUpdateStaff(updatedStaff);
        setError('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Funcionário: ${staffMember.name}`} size="2xl">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="staff-name" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" id="staff-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="staff-role" className="block text-sm font-medium text-gray-700">Cargo</label>
                        <select id="staff-role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {settings.staffRoles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="staff-email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="staff-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="staff-phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" id="staff-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="staff-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="staff-status" value={status} onChange={e => setStatus(e.target.value as StaffStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {Object.values(StaffStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditStaffModal;
