
import React, { useState } from 'react';
import { Student } from '../../types';
import Card from '../common/Card';
import GradesTab from '../students/tabs/GradesTab';
import AttendanceTab from '../students/tabs/AttendanceTab';
import OccurrencesTab from '../students/tabs/OccurrencesTab';
import DocumentsTab from '../students/tabs/DocumentsTab';

type AcademicTab = 'grades' | 'attendance' | 'occurrences' | 'documents';

const ParentAcademics: React.FC<{ student: Student }> = ({ student }) => {
    const [activeTab, setActiveTab] = useState<AcademicTab>('grades');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'grades': return <GradesTab grades={student.grades} />;
            case 'attendance': return <AttendanceTab attendance={student.attendance} />;
            case 'occurrences': return <OccurrencesTab occurrences={student.occurrences} />;
            case 'documents': return <DocumentsTab documents={student.documents} />;
            default: return null;
        }
    };
    
    return (
        <Card>
             <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Vida Acadêmica de {student.name}</h1>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('grades')} className={`${activeTab === 'grades' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Notas</button>
                    <button onClick={() => setActiveTab('attendance')} className={`${activeTab === 'attendance' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Frequência</button>
                    <button onClick={() => setActiveTab('occurrences')} className={`${activeTab === 'occurrences' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Ocorrências</button>
                    <button onClick={() => setActiveTab('documents')} className={`${activeTab === 'documents' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Documentos</button>
                </nav>
            </div>
            <div className="pt-6">
                {renderContent()}
            </div>
        </Card>
    );
};

export default ParentAcademics;
