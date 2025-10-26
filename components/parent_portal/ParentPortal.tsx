import React, { Suspense } from 'react';
import { useData } from '../../contexts/DataContext';
import ParentHeader from './ParentHeader';
import ParentDashboard from './ParentDashboard';
import { useAuth } from '../../contexts/AuthContext';
import NotificationToggle from './NotificationToggle';

const ParentPortal: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { students, invoices, communications, agendaItems, loading } = useData();
    const { currentUser } = useAuth();

    if (loading) {
        return <div className="flex h-screen w-screen items-center justify-center"><p>Carregando portal...</p></div>;
    }
    
    // Find the student linked to the current parent user
    const student = students.find(s => s.id === currentUser?.student_id);

    if (!student) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-center p-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text-dark">Erro de Acesso</h1>
                    <p className="mt-2 text-brand-text">Não foi possível encontrar um aluno vinculado ao seu perfil.</p>
                    <p className="text-sm text-brand-text-light mt-1">Por favor, entre em contato com a secretaria da escola para verificar seu cadastro.</p>
                    <button 
                        onClick={onLogout}
                        className="mt-6 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        );
    }

    // Filter data specifically for the logged-in parent's child
    const studentInvoices = invoices.filter(inv => inv.student_id === student.id);
    
    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <ParentHeader studentName={student.name} onLogout={onLogout} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <NotificationToggle />
                <ParentDashboard 
                    student={student} 
                    invoices={studentInvoices} 
                    communications={communications} 
                    agendaItems={agendaItems} 
                />
            </main>
        </div>
    );
};

export default ParentPortal;