import React, { useEffect, useRef, useState } from 'react';

interface Notification {
    id: number;
    type: 'lead' | 'invoice' | 'event';
    title: string;
    description: string;
    time: string;
    read: boolean;
}

const mockNotificationsData: Notification[] = [
    { id: 1, type: 'lead', title: 'Nova Admissão', description: 'Um novo lead, Família Andrade, foi adicionado.', time: '2 min atrás', read: false },
    { id: 2, type: 'invoice', title: 'Cobrança Atrasada', description: 'A fatura #INV-20240701 está atrasada.', time: '1 hora atrás', read: false },
    { id: 3, type: 'event', title: 'Próximo Evento', description: 'Lembrete: A Reunião de Pais e Mestres é amanhã.', time: '3 horas atrás', read: true },
    { id: 4, type: 'invoice', title: 'Pagamento Recebido', description: 'Pagamento de R$ 850,00 recebido de Família Souza.', time: '1 dia atrás', read: true },
];

const getIconForType = (type: 'lead' | 'invoice' | 'event') => {
    switch (type) {
        case 'lead':
            return <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
        case 'invoice':
            return <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
        case 'event':
            return <svg className="w-6 h-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
        default: return null;
    }
};

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    setHasUnread: (hasUnread: boolean) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, setHasUnread }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState(mockNotificationsData);

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
    
    const handleMarkAllAsRead = () => {
        const updatedNotifications = notifications.map(n => ({...n, read: true}));
        setNotifications(updatedNotifications);
        setHasUnread(false);
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
                    {notifications.length > 0 ? notifications.map(notification => (
                        <li key={notification.id} className={`p-4 flex items-start space-x-4 hover:bg-slate-50 transition-colors duration-200 relative ${!notification.read ? 'bg-sky-50' : ''}`}>
                             {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand-primary"></div>}
                            <div className="flex-shrink-0 ml-3">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 relative">
                                <p className="text-sm font-semibold text-brand-text-dark">{notification.title}</p>
                                <p className="text-sm text-brand-text-light truncate">{notification.description}</p>
                                <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
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
