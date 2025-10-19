


import React, { useState, lazy, Suspense } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Communication } from '../../types';

// Lazy load the AI Assistant Modal to prevent its dependencies from loading upfront
const AIAssistantModal = lazy(() => import('./AIAssistantModal'));

interface ComposerProps {
    // FIX: Corrected Omit type to use 'school_id' (snake_case) and 'sent_date' to correctly match the property in the Communication type and resolve the TypeScript error.
    onSend: (newComm: Omit<Communication, 'id' | 'sent_date' | 'school_id'>) => void;
}

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" />
        <path d="M5 21L6 17" />
        <path d="M19 21L18 17" />
        <path d="M3 12L7 11" />
        <path d="M21 12L17 11" />
    </svg>
);

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const Composer: React.FC<ComposerProps> = ({ onSend }) => {
    const { settings } = useSettings();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [recipientGroup, setRecipientGroup] = useState('Todos os Pais');
    const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
    const [error, setError] = useState('');

    const handleSend = () => {
        if (!title || !content || !recipientGroup) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        // FIX: Corrected property name from `recipientGroup` to `recipient_group`.
        onSend({ title, content, recipient_group: recipientGroup });
        // Reset form
        setTitle('');
        setContent('');
        setRecipientGroup('Todos os Pais');
        setError('');
    };
    
    const handleAIGenerate = (text: string) => {
        setContent(text);
        setAIAssistantOpen(false);
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-text-dark">Novo Comunicado</h2>
             {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            <div>
                <label htmlFor="recipientGroup" className="block text-sm font-medium text-gray-700">Enviar Para</label>
                <select
                    id="recipientGroup"
                    value={recipientGroup}
                    onChange={e => setRecipientGroup(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                >
                    <option value="Todos os Pais">Todos os Pais</option>
                    <option value="Todos">Todos (Pais e Funcionários)</option>
                    {settings.classes.map(className => (
                        <option key={className} value={`Pais - ${className}`}>{`Pais - ${className}`}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="Ex: Reunião de Pais e Mestres"
                />
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Conteúdo</label>
                    <button
                        onClick={() => setAIAssistantOpen(true)}
                        className="flex items-center text-sm font-medium text-brand-primary hover:text-sky-700"
                    >
                        <SparklesIcon className="w-4 h-4 mr-1" />
                        Gerar com IA
                    </button>
                </div>
                <textarea
                    id="content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="Escreva sua mensagem aqui..."
                />
            </div>
            <div className="flex justify-end">
                <button
                    onClick={handleSend}
                    className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                >
                    <SendIcon className="w-5 h-5 mr-2" />
                    Enviar Comunicado
                </button>
            </div>

            {isAIAssistantOpen && (
                <Suspense fallback={<div className="text-center p-4">Carregando Assistente IA...</div>}>
                    <AIAssistantModal
                        isOpen={isAIAssistantOpen}
                        onClose={() => setAIAssistantOpen(false)}
                        onTextGenerated={handleAIGenerate}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default Composer;