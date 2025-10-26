import React, { useState } from 'react';
import { Student, Invoice, AgendaItem, PaymentStatus, AgendaItemType, Communication } from '../../types';
import Card from '../common/Card';
import Modal from '../common/Modal';
import IndividualAgendaTab from '../students/tabs/IndividualAgendaTab';
import ParentAcademics from './ParentAcademics';
import ParentFinancials from './ParentFinancials';
import Gallery from '../Gallery';
import Agenda from '../Agenda';
import Library from '../Library';
import RequestDeclarationModal from './RequestDeclarationModal';
import { useData } from '../../contexts/DataContext';


const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);


interface ParentDashboardProps {
    student: Student;
    invoices: Invoice[];
    agendaItems: AgendaItem[];
    communications: Communication[];
}

type ModalView = 'academics' | 'financials' | 'communications' | 'gallery' | 'agenda' | 'library' | 'requestDeclaration';

const DashboardCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <Card onClick={onClick} className="flex flex-col items-center text-center p-4 cursor-pointer hover:border-brand-primary hover:shadow-lg transition-all duration-300 h-full">
        <div className="bg-brand-primary/10 text-brand-primary p-4 rounded-full mb-3">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-brand-text-dark">{title}</h3>
        <p className="text-sm text-brand-text-light flex-grow">{description}</p>
    </Card>
);

const CommunicationsModalContent: React.FC<{ communications: Communication[], student: Student }> = ({ communications, student }) => {
    const { updateStudent } = useData();
    const [activeTab, setActiveTab] = useState('mural');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    const handleSendMessage = async () => {
        if (!message.trim()) {
            setError('A mensagem não pode estar vazia.');
            return;
        }
        setError('');
        setIsSending(true);

        const newLogEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Mensagem do Portal' as const,
            summary: message,
        };

        const updatedStudent: Student = {
            ...student,
            communication_log: [newLogEntry, ...student.communication_log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        
        try {
            await updateStudent(updatedStudent);
            setMessage('');
        } catch (e) {
            setError('Ocorreu um erro ao enviar a mensagem.');
        } finally {
            setIsSending(false);
        }
    };
    
    const parentMessages = student.communication_log.filter(log => log.type === 'Mensagem do Portal');

    return (
        <div>
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('mural')} className={`${activeTab === 'mural' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Mural da Escola</button>
                    <button onClick={() => setActiveTab('fale')} className={`${activeTab === 'fale' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Fale com a Escola</button>
                </nav>
            </div>
            {activeTab === 'mural' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {communications.map(comm => (
                        <div key={comm.id} className="p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-bold">{comm.title}</h3>
                            <p className="text-sm text-slate-500">Em {new Date(comm.sent_date).toLocaleDateString()}</p>
                            <p className="mt-2 text-brand-text whitespace-pre-wrap">{comm.content}</p>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'fale' && (
                <div className="space-y-4">
                     {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Escreva sua mensagem..."/>
                    <div className="flex justify-end">
                        <button onClick={handleSendMessage} disabled={isSending} className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 disabled:bg-slate-400">
                             <SendIcon className="w-5 h-5 mr-2" />{isSending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                    {parentMessages.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-2">Histórico de Mensagens</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {parentMessages.map(log => (
                                    <div key={log.id} className="p-2 bg-slate-100 rounded text-sm">
                                        <p>{log.summary}</p>
                                        <p className="text-xs text-slate-400 text-right">Em: {new Date(log.date).toLocaleString('pt-BR')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const ParentDashboard: React.FC<ParentDashboardProps> = ({ student, invoices, agendaItems, communications }) => {
    const [activeModal, setActiveModal] = useState<ModalView | null>(null);

    const upcomingEvents = agendaItems
        .filter(item => new Date(item.date) >= new Date() && item.type === AgendaItemType.Event)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    const dashboardItems = [
        { id: 'academics', title: 'Vida Acadêmica', description: 'Notas, frequência, ocorrências e documentos.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v3m-7-3 7 3 7-3M2 10h20M6 5v17m6-17v17m6-17v17m-12 1L6 11l6 3 6-3 6-3"/></svg>},
        { id: 'financials', title: 'Financeiro', description: 'Acesse faturas, pagamentos e situação financeira.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>},
        { id: 'communications', title: 'Comunicação', description: 'Mural de avisos da escola e canal para contato.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
        { id: 'agenda', title: 'Agenda da Escola', description: 'Fique por dentro dos eventos e datas importantes.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
        { id: 'gallery', title: 'Mural de Fotos', description: 'Veja os momentos especiais registrados na escola.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>},
        { id: 'library', title: 'Biblioteca', description: 'Consulte o acervo de livros disponíveis.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5a2.5 2.5 0 0 1 0-5H20V5H6.5A2.5 2.5 0 0 1 4 2.5v17Z"/></svg>},
        { id: 'requestDeclaration', title: 'Solicitar Declarações', description: 'Peça documentos como declaração de matrícula.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
    ];

    const renderModalContent = () => {
        switch(activeModal) {
            case 'academics': return <ParentAcademics student={student} />;
            case 'financials': return <ParentFinancials invoices={invoices} studentName={student.name} />;
            case 'communications': return <CommunicationsModalContent communications={communications} student={student} />;
            case 'gallery': return <Gallery />;
            case 'agenda': return <Agenda />;
            case 'library': return <Library />;
            default: return null;
        }
    };
    
    const getModalTitle = () => dashboardItems.find(item => item.id === activeModal)?.title || '';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-brand-text-dark">Olá, {student.parent_name}!</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dashboardItems.map(item => (
                    <DashboardCard 
                        key={item.id}
                        title={item.title} 
                        description={item.description} 
                        icon={item.icon} 
                        onClick={() => setActiveModal(item.id as ModalView)} 
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold text-brand-text-dark mb-4">Agenda Individual do Dia</h2>
                    <IndividualAgendaTab agendaItems={student.individual_agenda} />
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

            {/* Modals for each section */}
            <Modal isOpen={!!activeModal && activeModal !== 'requestDeclaration'} onClose={() => setActiveModal(null)} title={getModalTitle()} size="4xl">
                {renderModalContent()}
            </Modal>
            
            <RequestDeclarationModal isOpen={activeModal === 'requestDeclaration'} onClose={() => setActiveModal(null)} student={student} />
        </div>
    );
};

export default ParentDashboard;
