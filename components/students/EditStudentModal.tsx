
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';
// FIX: Corrected import path for types.
import { Student, StudentStatus } from '../../types';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onUpdateStudent: (student: Student) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onUpdateStudent }) => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentContact, setParentContact] = useState('');
    const [cpf, setCpf] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<StudentStatus>(StudentStatus.Active);
    
    const [error, setError] = useState('');

    useEffect(() => {
        if (student) {
            setName(student.name);
            setStudentClass(student.class);
            setParentName(student.parentName);
            setParentContact(student.parentContact);
            setCpf(student.cpf);
            setAddress(student.address);
            setEmail(student.email);
            setStatus(student.status);
        }
    }, [student]);

    const handleSubmit = () => {
        if (!name || !studentClass || !parentName || !parentContact) {
            setError('Nome, Turma, Nome do Responsável e Contato são obrigatórios.');
            return;
        }

        const updatedStudent: Student = {
            ...student,
            name,
            class: studentClass,
            parentName,
            parentContact,
            cpf,
            address,
            email,
            status,
        };

        onUpdateStudent(updatedStudent);
        setError('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Aluno: ${student.name}`} size="3xl">
            <div className="space-y-4">
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nome Completo do Aluno</label>
                        <input type="text" id="edit-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="edit-studentClass" className="block text-sm font-medium text-gray-700">Turma</label>
                        <select id="edit-studentClass" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {settings.classes.map(className => (
                                <option key={className} value={className}>{className}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="edit-parentName" className="block text-sm font-medium text-gray-700">Nome do Responsável</label>
                        <input type="text" id="edit-parentName" value={parentName} onChange={e => setParentName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="edit-parentContact" className="block text-sm font-medium text-gray-700">Contato Principal (Telefone)</label>
                        <input type="text" id="edit-parentContact" value={parentContact} onChange={e => setParentContact(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email do Responsável</label>
                        <input type="email" id="edit-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="edit-cpf" className="block text-sm font-medium text-gray-700">CPF do Responsável</label>
                        <input type="text" id="edit-cpf" value={cpf} onChange={e => setCpf(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="edit-status" value={status} onChange={e => setStatus(e.target.value as StudentStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            {Object.values(StudentStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" id="edit-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
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

export default EditStudentModal;
