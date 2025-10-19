
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import ParentHeader from './ParentHeader';
import ParentDashboard from './ParentDashboard';
import ParentAcademics from './ParentAcademics';
import ParentFinancials from './ParentFinancials';
import ParentCommunications from './ParentCommunications';

export type ParentView = 'dashboard' | 'academics' | 'financials' | 'communications';

const ParentPortal: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { students, invoices, communications, agendaItems, loading } = useData();
    const [activeView, setActiveView] = useState<ParentView>('dashboard');

    if (loading) {
        return <div className="flex h-screen w-screen items-center justify-center"><p>Carregando portal...</p></div>;
    }
    
    // Simulate logged-in parent of the first student
    const student = students[0];
    if (!student) {
        return <div className="flex h-screen w-screen items-center justify-center"><p>Aluno não encontrado.</p></div>;
    }

    // FIX: Corrected property name from `studentId` to `student_id`.
    const studentInvoices = invoices.filter(inv => inv.student_id === student.id);
    
    const renderView = () => {
        switch(activeView) {
            case 'dashboard':
                return <ParentDashboard student={student} invoices={studentInvoices} agendaItems={agendaItems} />;
            case 'academics':
                return <ParentAcademics student={student} />;
            case 'financials':
                return <ParentFinancials invoices={studentInvoices} studentName={student.name} />;
            case 'communications':
                return <ParentCommunications communications={communications} />;
            default:
                return <ParentDashboard student={student} invoices={studentInvoices} agendaItems={agendaItems} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <ParentHeader studentName={student.name} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </div>
    );
};

export default ParentPortal;