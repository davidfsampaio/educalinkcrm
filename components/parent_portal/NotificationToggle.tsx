import React, { useState, useEffect } from 'react';
import { subscribeUserToPush } from '../../utils/pushNotifications';

type PermissionStatus = 'default' | 'granted' | 'denied';

const BellIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);

const NotificationToggle: React.FC = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<PermissionStatus>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setIsSupported(false);
            setIsLoading(false);
            return;
        }

        setIsSupported(true);
        setPermission(Notification.permission as PermissionStatus);

        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                    setIsSubscribed(true);
                }
                setIsLoading(false);
            });
        });
    }, []);

    const handleSubscribe = async () => {
        setIsLoading(true);
        setError('');
        try {
            await subscribeUserToPush();
            setIsSubscribed(true);
            setPermission('granted');
        } catch (err: any) {
            setError(err.message || 'Falha ao ativar notificações.');
             // Se a permissão for negada, atualiza o estado
            if (Notification.permission === 'denied') {
                setPermission('denied');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported || isLoading) {
        return null; // Não mostra nada se não for suportado ou estiver carregando
    }
    
    if (isSubscribed || permission === 'granted') {
         return (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                <p className="font-bold">As notificações estão ativadas para este dispositivo!</p>
                <p>Você será avisado sobre novos comunicados e apontamentos.</p>
            </div>
        );
    }
    
    if (permission === 'denied') {
         return (
            <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                <p className="font-bold">As notificações estão bloqueadas.</p>
                <p>Para recebê-las, você precisa habilitar a permissão nas configurações do seu navegador para este site.</p>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-sky-100 border border-sky-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
                <BellIcon className="w-8 h-8 text-sky-600 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-sky-800">Fique por dentro de tudo!</h3>
                    <p className="text-sm text-sky-700">Ative as notificações para ser avisado em tempo real sobre comunicados, eventos e outras novidades da escola.</p>
                </div>
            </div>
             {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                onClick={handleSubscribe}
                className="flex-shrink-0 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600 transition-colors shadow-sm w-full sm:w-auto"
            >
                Ativar Notificações
            </button>
        </div>
    );
};

export default NotificationToggle;