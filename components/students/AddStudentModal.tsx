



import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';
// FIX: Corrected import path for types.
import { Student } from '../../types';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Corrected Omit type to use snake_case to correctly match the properties in the Student type and resolve the TypeScript error.
    onAddStudent: (student: Omit<Student, 'id'|'school_id'|'status'|'enrollment_date'|'avatar_url'|'grades'|'attendance'|'occurrences'|'documents'|'individual_agenda'|'communication_log'|'tuition_plan_id'|'medical_notes'>) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onAddStudent }) => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState(settings.classes[0] || '');
    const [parentName, setParentName] = useState('');
    const [parentContact, setParentContact] = useState('');
    const [cpf, setCpf] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name || !studentClass || !parentName || !parentContact) {
            setError('Nome, Turma, Nome do Responsável e Contato são obrigatórios.');
            return;
        }

        onAddStudent({
            name,
            class: studentClass,
            parent_name: parentName,
            parent_contact: parentContact,
            cpf,
            address,
            email,
            phone,
        });
        
        // Reset form and close
        setName('');
        setStudentClass(settings.classes[0] || '');
        setParentName('');
        setParentContact('');
        setCpf('');
        setAddress('');
        setEmail('');
        setPhone('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Aluno" size="3xl">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo do Aluno</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700">Turma</label>
                        <select id="studentClass" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {settings.classes.map(className => (
                                <option key={className} value={className}>{className}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Nome do Responsável</label>
                        <input type="text" id="parentName" value={parentName} onChange={e => setParentName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">Contato Principal (Telefone)</label>
                        <input type="text" id="parentContact" value={parentContact} onChange={e => setParentContact(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email do Responsável</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF do Responsável</label>
                        <input type="text" id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Salvar Aluno
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddStudentModal;