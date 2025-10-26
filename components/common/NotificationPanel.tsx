import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { PaymentStatus, View, StudentDetailTab } from '../../types';

interface Notification {
    id: string;
    type: 'lead' | 'invoice' | 'event' | 'message' | 'request';
    title: string;
    description: string;
    time: string; // ISO date string
    read: boolean;
    view: View;
    item?: any;
    subView?: StudentDetailTab;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    setHasUnread: (hasUnread: boolean) => void;
    onNotificationSelect: (item: any, view: View, subView?: string) => void;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return years === 1 ? "1 ano atrás" : `${years} anos atrás`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        return months === 1 ? "1 mês atrás" : `${months} meses atrás`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return days === 1 ? "ontem" : `${days} dias atrás`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return hours === 1 ? "1 hora atrás" : `${hours} horas atrás`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return minutes === 1 ? "1 minuto atrás" : `${minutes} minutos atrás`;
    }
    return "agora mesmo";
}

const FileTextIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);


const getIconForType = (type: 'lead' | 'invoice' | 'event' | 'message' | 'request') => {
    switch (type) {
        case 'lead':
            // FIX: Corrected typo in viewBox attribute.
            return <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
        case 'invoice':
            // FIX: Corrected typo in viewBox attribute.
            return <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
        case 'event':
            // FIX: Corrected typo in viewBox attribute.
            return <svg className="w-6 h-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
        case 'message':
            // FIX: Corrected typo in viewBox attribute.
            return <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
        case 'request':
            return <FileTextIcon className="w-6 h-6 text-indigo-500" />;
        default: return null;
    }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, setHasUnread, onNotificationSelect }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const { leads, invoices, agendaItems, students } = useData();
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    const allNotifications = useMemo((): Notification[] => {
        const generated: Omit<Notification, 'read'>[] = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // New Leads (last 7 days)
        leads.forEach(lead => {
            if (new Date(lead.interest_date) > sevenDaysAgo) {
                generated.push({
                    id: `lead-${lead.id}`, type: 'lead', title: 'Nova Admissão',
                    description: `Novo lead: ${lead.name}.`, time: lead.interest_date,
                    view: 'leads', item: lead,
                });
            }
        });

        // Overdue Invoices
        invoices.forEach(invoice => {
            if (invoice.status === PaymentStatus.Overdue) {
                generated.push({
                    id: `invoice-${invoice.id}`, type: 'invoice', title: 'Cobrança Atrasada',
                    description: `Fatura ${invoice.id} para ${invoice.student_name} está atrasada.`, time: invoice.due_date,
                    view: 'financials', item: invoice,
                });
            }
        });
        
        // Upcoming Events (next 7 days)
        const today = new Date();
        const nextSevenDays = new Date();
        nextSevenDays.setDate(today.getDate() + 7);
        agendaItems.forEach(item => {
            const itemDate = new Date(item.date);
            const todayDateOnly = new Date(today.setHours(0,0,0,0));
            if (itemDate >= todayDateOnly && itemDate <= nextSevenDays) {
                 generated.push({
                    id: `event-${item.id}`, type: 'event', title: 'Próximo Evento',
                    description: `${item.title} em ${new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`,
                    time: item.date,
                    view: 'agenda',
                });
            }
        });
        
        // New Parent Messages & Declaration Requests (last 7 days)
        students.forEach(student => {
            student.communication_log.forEach(log => {
                const logDate = new Date(log.date);
                if (logDate > sevenDaysAgo) {
                    if (log.type === 'Mensagem do Portal') {
                        generated.push({
                            id: `msg-${log.id}`, type: 'message', title: 'Mensagem de Responsável',
                            description: `De ${student.parent_name} (aluno(a): ${student.name}).`, time: log.date,
                            view: 'students', item: student, subView: 'contactHistory',
                        });
                    } else if (log.type === 'Sistema' && log.summary.startsWith('[SOLICITAÇÃO]')) {
                        generated.push({
                            id: `req-${log.id}`, type: 'request',
                            title: 'Solicitação de Declaração',
                            description: `${student.parent_name} solicitou um documento para ${student.name}.`,
                            time: log.date,
                            view: 'students', 
                            item: student,
                            subView: 'declarations',
                        });
                    }
                }
            });
        });

        return generated
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .map(n => ({...n, read: readIds.has(n.id)}));

    }, [leads, invoices, agendaItems, students, readIds]);

    useEffect(() => {
        const hasUnreadNotifications = allNotifications.some(n => !n.read);
        setHasUnread(hasUnreadNotifications);
    }, [allNotifications, setHasUnread]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleNotificationClick = (notification: Notification) => {
        handleMarkOneAsRead(notification.id);
        if (notification.view) {
            onNotificationSelect(notification.item, notification.view, notification.subView);
        }
        onClose();
    };
    
    const handleMarkAllAsRead = () => {
        const allIds = new Set(allNotifications.map(n => n.id));
        setReadIds(allIds);
    };

    const handleMarkOneAsRead = (id: string) => {
        setReadIds(prev => new Set(prev).add(id));
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-16 right-4 w-80 max-w-sm bg-white rounded-lg border border-slate-200 shadow-2xl z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-panel-title"
        >
            <div className="flex justify-between items-center p-4 border-b">
                <h2 id="notification-panel-title" className="text-lg font-bold text-brand-text-dark">Notificações</h2>
                <button 
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-medium text-brand-primary hover:underline"
                >
                    Marcar todas como lidas
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-slate-200">
                    {allNotifications.length > 0 ? allNotifications.map(notification => (
                        <li 
                            key={notification.id} 
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 flex items-start space-x-4 hover:bg-slate-50 transition-colors duration-200 relative cursor-pointer ${!notification.read ? 'bg-sky-50' : ''}`}
                        >
                             {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand-primary"></div>}
                            <div className="flex-shrink-0 ml-3">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 relative">
                                <p className="text-sm font-semibold text-brand-text-dark">{notification.title}</p>
                                <p className="text-sm text-brand-text-light truncate">{notification.description}</p>
                                <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notification.time)}</p>
                            </div>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-brand-text-light">
                            Nenhuma notificação nova.
                        </li>
                     )}
                </ul>
            </div>
             <div className="p-2 border-t text-center bg-slate-50 rounded-b-lg">
                 <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-brand-primary hover:underline">Ver todas</a>
            </div>
        </div>
    );
};

export default NotificationPanel;