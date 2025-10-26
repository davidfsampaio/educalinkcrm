import React, { useState } from 'react';
import { Communication, Student, CommunicationLog } from '../../types';
import Card from '../common/Card';
import { useData } from '../../contexts/DataContext';

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

interface ParentCommunicationsProps {
    communications: Communication[];
    student: Student;
}

const ParentCommunications: React.FC<ParentCommunicationsProps> = ({ communications, student }) => {
    const { updateStudent } = useData();
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

        const newLogEntry: CommunicationLog = {
            id: Date.now(), // Temp ID, backend handles the real one
            date: new Date().toISOString(),
            type: 'Mensagem do Portal',
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
            setError('Ocorreu um erro ao enviar a mensagem. Tente novamente.');
        } finally {
            setIsSending(false);
        }
    };
    
    const parentMessages = student.communication_log.filter(log => log.type === 'Mensagem do Portal');

    return (
        <div className="space-y-6">
            <Card>
                <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Fale com a Escola</h1>
                <div className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="message-content" className="block text-sm font-medium text-gray-700">Sua Mensagem</label>
                        <textarea
                            id="message-content"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            placeholder="Escreva sua dúvida, sugestão ou comunicado aqui..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleSendMessage}
                            disabled={isSending}
                            className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm disabled:bg-slate-400"
                        >
                            <SendIcon className="w-5 h-5 mr-2" />
                            {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                        </button>
                    </div>
                </div>

                {parentMessages.length > 0 && (
                     <div className="mt-6 pt-6 border-t">
                        <h2 className="text-xl font-bold text-brand-text-dark mb-4">Histórico de Mensagens Enviadas</h2>
                         <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                             {parentMessages.map(log => (
                                 <div key={log.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                     <p className="text-sm text-brand-text whitespace-pre-wrap">{log.summary}</p>
                                     <p className="text-xs text-slate-400 text-right mt-2">
                                         Enviado em: {new Date(log.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                     </p>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Mural de Comunicados da Escola</h1>
                <div className="space-y-4">
                    {communications.map((comm) => (
                        <div key={comm.id} className="p-4 border border-slate-200/80 rounded-lg bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-brand-text-dark">{comm.title}</h3>
                                    <p className="text-sm text-brand-text-light">
                                        Para: <span className="font-medium">{comm.recipient_group}</span>
                                    </p>
                                </div>
                                <span className="text-sm text-brand-text-light whitespace-nowrap">
                                    {new Date(comm.sent_date).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <p className="mt-2 text-brand-text whitespace-pre-wrap">
                                {comm.content}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ParentCommunications;