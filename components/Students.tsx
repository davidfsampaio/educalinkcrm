import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card from './common/Card';
import { Student, StudentStatus } from '../types';
import StudentDetailModal from './students/StudentDetailModal';
import AddStudentModal from './students/AddStudentModal'; // Import the new modal
import EditStudentModal from './students/EditStudentModal'; // Import the edit modal
import ProtectedComponent from './common/ProtectedComponent';
import { useSettings } from '../contexts/SettingsContext';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface StudentsProps {
    initialStudent?: Student | null;
    initialAction?: string | null; // New prop for PWA shortcuts
}

const Students: React.FC<StudentsProps> = ({ initialStudent, initialAction }) => {
    const { students, addStudent, updateStudent, loading } = useData();
    const { settings } = useSettings();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [classFilter, setClassFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (initialStudent) {
            const studentToSelect = students.find(s => s.id === initialStudent.id);
            if (studentToSelect) {
                handleRowClick(studentToSelect);
            }
        }
    }, [initialStudent, students]);

    // Handle PWA shortcut action
    useEffect(() => {
        if (initialAction === 'new_student') {
            setAddModalOpen(true);
        }
    }, [initialAction]);


    const handleRowClick = (student: Student) => {
        setSelectedStudent(student);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedStudent(null);
    };

    const handleOpenEditModal = (student: Student) => {
        setEditingStudent(student);
        setDetailModalOpen(false); // Close detail modal
        setEditModalOpen(true);
    };

    const handleUpdateStudent = (updatedStudent: Student) => {
        updateStudent(updatedStudent);
        if (selectedStudent && selectedStudent.id === updatedStudent.id) {
            setSelectedStudent(updatedStudent);
        }
        setEditModalOpen(false);
        setEditingStudent(null);
    };

    const handleAddStudent = (newStudentData: Omit<Student, 'id'|'status'|'enrollmentDate'|'avatarUrl'|'grades'|'attendance'|'occurrences'|'documents'|'individualAgenda'|'communicationLog'|'tuitionPlanId'|'medicalNotes'>) => {
        addStudent(newStudentData);
        setAddModalOpen(false);
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const classMatch = classFilter === 'all' || student.class === classFilter;
            const statusMatch = statusFilter === 'all' || student.status === statusFilter;
            return classMatch && statusMatch;
        });
    }, [students, classFilter, statusFilter]);


    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Lista de Alunos</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="all">Todas as Turmas</option>
                            {settings.classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="all">Todos os Status</option>
                            {Object.values(StudentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ProtectedComponent requiredPermission='create_students'>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Adicionar Aluno
                            </button>
                        </ProtectedComponent>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} onClick={() => handleRowClick(student)} className="cursor-pointer hover:bg-slate-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full mr-4" src={student.avatarUrl} alt={student.name} />
                                            <div className="font-medium text-brand-text-dark">{student.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-brand-text-dark">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-brand-text-dark">{student.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-brand-text-dark">{student.parentName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <AddStudentModal 
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddStudent={handleAddStudent}
            />

            {editingStudent && (
                <EditStudentModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    student={editingStudent}
                    onUpdateStudent={handleUpdateStudent}
                />
            )}

            {selectedStudent && (
                <StudentDetailModal 
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    student={selectedStudent}
                    onEdit={handleOpenEditModal}
                    onUpdateStudent={handleUpdateStudent}
                />
            )}
        </>
    );
};

export default Students;