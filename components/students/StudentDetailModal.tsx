

import React, { useState, useRef } from 'react';
// FIX: Corrected import path for types.
import { Student, StudentDetailTab, IndividualAgendaItem, IndividualAgendaItemType, Grade, Attendance, Occurrence, Document, CommunicationLog } from '../../types';
import Modal from '../common/Modal';
import DetailsTab from './tabs/DetailsTab';
import GradesTab from './tabs/GradesTab';
import AttendanceTab from './tabs/AttendanceTab';
import OccurrencesTab from './tabs/OccurrencesTab';
import IndividualAgendaTab from './tabs/IndividualAgendaTab';
import DocumentsTab from './tabs/DocumentsTab';
import ContactHistoryTab from './tabs/ContactHistoryTab';
// FIX: Corrected import path for DeclarationsTab.
import DeclarationsTab from './tabs/DeclarationsTab'; // Import the new tab component
import ProtectedComponent from '../common/ProtectedComponent';
import AddGradeModal from './modals/AddGradeModal';
import AddAttendanceModal from './modals/AddAttendanceModal';
import AddOccurrenceModal from './modals/AddOccurrenceModal';
import AddDocumentModal from './modals/AddDocumentModal';
import AddContactModal from './modals/AddContactModal';
import EditIndividualAgendaItemModal from './modals/EditIndividualAgendaItemModal';

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const CameraIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
);


interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onEdit: (student: Student) => void;
    onUpdateStudent: (student: Student) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student, onEdit, onUpdateStudent }) => {
    const [activeTab, setActiveTab] = useState<StudentDetailTab>('details');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for new modals
    const [isAddGradeModalOpen, setAddGradeModalOpen] = useState(false);
    const [isAddAttendanceModalOpen, setAddAttendanceModalOpen] = useState(false);
    const [isAddOccurrenceModalOpen, setAddOccurrenceModalOpen] = useState(false);
    const [isAddDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
    const [isAddContactModalOpen, setAddContactModalOpen] = useState(false);
    const [editingAgendaItem, setEditingAgendaItem] = useState<IndividualAgendaItem | null>(null);

    const handleAddIndividualAgendaItem = (itemData: { type: IndividualAgendaItemType; selections: string[]; description: string; }) => {
        const newItem: IndividualAgendaItem = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            isSent: false,
            ...itemData,
        };
        const updatedStudent: Student = {
            ...student,
            individualAgenda: [newItem, ...student.individualAgenda].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        onUpdateStudent(updatedStudent);
    };
    
    const handleDeleteIndividualAgendaItem = (itemId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir este registro da agenda?')) {
            const updatedAgenda = student.individualAgenda.filter(item => item.id !== itemId);
            const updatedStudent: Student = {
                ...student,
                individualAgenda: updatedAgenda,
            };
            onUpdateStudent(updatedStudent);
        }
    };

    const handleUpdateIndividualAgendaItem = (updatedItem: IndividualAgendaItem) => {
        const updatedAgenda = student.individualAgenda.map(item => item.id === updatedItem.id ? updatedItem : item);
        const updatedStudent: Student = {
            ...student,
            individualAgenda: updatedAgenda,
        };
        onUpdateStudent(updatedStudent);
        setEditingAgendaItem(null);
    };

    const handleAddGrade = (gradeData: Omit<Grade, ''>) => {
        const updatedStudent: Student = {
            ...student,
            grades: [gradeData, ...student.grades],
        };
        onUpdateStudent(updatedStudent);
        setAddGradeModalOpen(false);
    };

    const handleAddAttendance = (attendanceData: Omit<Attendance, ''>) => {
        const updatedStudent: Student = {
            ...student,
            attendance: [attendanceData, ...student.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        onUpdateStudent(updatedStudent);
        setAddAttendanceModalOpen(false);
    };

    const handleAddOccurrence = (occurrenceData: Omit<Occurrence, 'id'>) => {
        const newOccurrence: Occurrence = { id: Date.now(), ...occurrenceData };
        const updatedStudent: Student = {
            ...student,
            occurrences: [newOccurrence, ...student.occurrences].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        onUpdateStudent(updatedStudent);
        setAddOccurrenceModalOpen(false);
    };

    const handleAddDocument = (documentData: Omit<Document, 'id' | 'uploadDate'>) => {
        const newDocument: Document = { id: Date.now(), uploadDate: new Date().toISOString(), ...documentData };
        const updatedStudent: Student = {
            ...student,
            documents: [newDocument, ...student.documents],
        };
        onUpdateStudent(updatedStudent);
        setAddDocumentModalOpen(false);
    };

    const handleAddContact = (contactData: Omit<CommunicationLog, 'id'>) => {
        const newContact: CommunicationLog = { id: Date.now(), ...contactData };
        const updatedStudent: Student = {
            ...student,
            communicationLog: [newContact, ...student.communicationLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        onUpdateStudent(updatedStudent);
        setAddContactModalOpen(false);
    };


    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedStudent: Student = {
                    ...student,
                    avatar_url: reader.result as string,
                };
                onUpdateStudent(updatedStudent);
            };
            reader.readAsDataURL(file);
        }
    };

    const tabs: { id: StudentDetailTab, label: string }[] = [
        { id: 'details', label: 'Detalhes' },
        { id: 'grades', label: 'Notas' },
        { id: 'attendance', label: 'Frequência' },
        { id: 'occurrences', label: 'Ocorrências' },
        { id: 'individualAgenda', label: 'Agenda Individual' },
        { id: 'documents', label: 'Documentos' },
        { id: 'contactHistory', label: 'Histórico de Contato' },
        { id: 'declarations', label: 'Declarações' },
    ];
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details': return <DetailsTab student={student} />;
            case 'grades': return <GradesTab grades={student.grades} onAdd={() => setAddGradeModalOpen(true)} />;
            case 'attendance': return <AttendanceTab attendance={student.attendance} onAdd={() => setAddAttendanceModalOpen(true)} />;
            case 'occurrences': return <OccurrencesTab occurrences={student.occurrences} onAdd={() => setAddOccurrenceModalOpen(true)} />;
            case 'individualAgenda': return <IndividualAgendaTab agendaItems={student.individualAgenda} onAddItem={handleAddIndividualAgendaItem} onEdit={setEditingAgendaItem} onDelete={handleDeleteIndividualAgendaItem} />;
            case 'documents': return <DocumentsTab documents={student.documents} onAdd={() => setAddDocumentModalOpen(true)} />;
            case 'contactHistory': return <ContactHistoryTab log={student.communicationLog} onAdd={() => setAddContactModalOpen(true)} />;
            case 'declarations': return <DeclarationsTab student={student} />;
            default: return null;
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Perfil do Aluno" size="5xl">
                <div className="flex flex-col md:flex-row gap-6 -mt-6">
                    {/* Left Panel */}
                    <div className="w-full md:w-1/4 bg-slate-100 rounded-xl p-6 border border-slate-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group">
                                <img src={student.avatar_url} alt={student.name} className="w-24 h-24 rounded-full mb-4 ring-4 ring-brand-primary/20 group-hover:opacity-75 transition-opacity" />
                                <ProtectedComponent requiredPermission='edit_students'>
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity mb-4"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Alterar foto"
                                    >
                                        <CameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                </ProtectedComponent>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                            />
                            <h2 className="text-xl font-bold text-brand-text-dark">{student.name}</h2>
                            <p className="text-brand-text-dark">{student.class}</p>
                            <span className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full ${student.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.status}
                            </span>
                        </div>
                        <div className="mt-6 border-t pt-4 text-center">
                            <h4 className="font-bold text-brand-text-dark mb-2">Responsável</h4>
                            <p className="text-brand-text-dark">{student.parent_name}</p>
                            <p className="text-brand-text-dark text-sm">{student.parent_contact}</p>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <ProtectedComponent requiredPermission='edit_students'>
                                <button 
                                    onClick={() => onEdit(student)}
                                    className="w-full flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300">
                                    <EditIcon className="w-4 h-4 mr-2" />
                                    Editar Perfil
                                </button>
                            </ProtectedComponent>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-full md:w-3/4">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-brand-primary text-brand-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="pt-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Modals */}
            <AddGradeModal isOpen={isAddGradeModalOpen} onClose={() => setAddGradeModalOpen(false)} onAdd={handleAddGrade} />
            <AddAttendanceModal isOpen={isAddAttendanceModalOpen} onClose={() => setAddAttendanceModalOpen(false)} onAdd={handleAddAttendance} />
            <AddOccurrenceModal isOpen={isAddOccurrenceModalOpen} onClose={() => setAddOccurrenceModalOpen(false)} onAdd={handleAddOccurrence} />
            <AddDocumentModal isOpen={isAddDocumentModalOpen} onClose={() => setAddDocumentModalOpen(false)} onAdd={handleAddDocument} />
            <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setAddContactModalOpen(false)} onAdd={handleAddContact} />
            {editingAgendaItem && (
                <EditIndividualAgendaItemModal
                    isOpen={!!editingAgendaItem}
                    onClose={() => setEditingAgendaItem(null)}
                    item={editingAgendaItem}
                    onUpdate={handleUpdateIndividualAgendaItem}
                />
            )}
        </>
    );
};

export default StudentDetailModal;