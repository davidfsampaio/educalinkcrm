import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';
import { Staff, StaffRole } from '../../types';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Corrected Omit type to use 'schoolId' (camelCase) instead of 'school_id' (snake_case) to correctly match the property in the Staff type and resolve the TypeScript error.
    onAddStaff: (staff: Omit<Staff, 'id' | 'schoolId' | 'status' | 'hireDate' | 'avatarUrl'>) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAddStaff }) => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>(settings.staffRoles[0] || '');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name || !role || !email) {
            setError('Nome, Cargo e Email são obrigatórios.');
            return;
        }

        onAddStaff({
            name,
            role,
            email,
            phone,
            cpf,
            address,
        });

        // Reset form and close
        setName('');
        setRole(settings.staffRoles[0] || '');
        setEmail('');
        setPhone('');
        setCpf('');
        setAddress('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Funcionário" size="3xl">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="staff-add-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="staff-add-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="staff-add-role" className="block text-sm font-medium text-gray-700">Cargo</label>
                        <select id="staff-add-role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {settings.staffRoles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="staff-add-email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="staff-add-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="staff-add-phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" id="staff-add-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="staff-add-cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" id="staff-add-cpf" value={cpf} onChange={e => setCpf(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="staff-add-address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" id="staff-add-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Funcionário
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddStaffModal;