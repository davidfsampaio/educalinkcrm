
import React from 'react';
import { Student, Invoice, AgendaItem, PaymentStatus, AgendaItemType } from '../../types';
import Card from '../common/Card';
import IndividualAgendaTab from '../students/tabs/IndividualAgendaTab';

interface ParentDashboardProps {
    student: Student;
    invoices: Invoice[];
    agendaItems: AgendaItem[];
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-brand-text-light">{title}</p>
            <p className="text-2xl font-bold text-brand-text-dark">{value}</p>
        </div>
    </Card>
);

const ParentDashboard: React.FC<ParentDashboardProps> = ({ student, invoices, agendaItems }) => {
    
    const overdueInvoices = invoices.filter(i => i.status === PaymentStatus.Overdue || i.status === PaymentStatus.Pending).length;
    
    const upcomingEvents = agendaItems
        .filter(item => new Date(item.date) >= new Date() && item.type === AgendaItemType.Event)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const latestGrade = [...student.grades].sort((a, b) => (b.term + b.subject).localeCompare(a.term + a.subject))[0];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-brand-text-dark">Olá, {student.parentName}!</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    title="Faturas em Aberto"
                    value={overdueInvoices}
                    color="bg-red-100 text-red-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                 />
                 <StatCard 
                    title="Próximo Evento"
                    value={upcomingEvents.length > 0 ? new Date(upcomingEvents[0].date).toLocaleDateString('pt-BR', { timeZone: 'UTC'}) : 'N/A'}
                    color="bg-sky-100 text-sky-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                 />
                 <StatCard 
                    title="Última Nota Lançada"
                    value={latestGrade ? latestGrade.score.toFixed(1) : 'N/A'}
                    color="bg-teal-100 text-teal-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 22v-4a2 2 0 1 0-4 0v4" /><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" /><path d="M18 5v17" /><path d="m12 14 6-3" /><path d="m6 11 6 3" /><path d="M6 5v17" /><path d="M12 5v17" /><path d="M2 10h20" /><path d="m19 4-7 3-7-3" /><path d="M12 2v3" /></svg>}
                 />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold text-brand-text-dark mb-4">Agenda Individual do Dia</h2>
                    <IndividualAgendaTab agendaItems={student.individualAgenda} />
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold text-brand-text-dark mb-4">Próximos Eventos da Escola</h2>
                     {upcomingEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingEvents.slice(0, 4).map(event => (
                                <li key={event.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="font-semibold text-brand-text-dark">{event.title}</p>
                                    <p className="text-sm text-brand-text">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC'})} - {event.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-brand-text">Nenhum evento futuro na agenda.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};
export default ParentDashboard;
