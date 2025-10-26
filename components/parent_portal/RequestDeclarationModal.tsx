import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Student, DeclarationType, CommunicationLog } from '../../types';
import { useData } from '../../contexts/DataContext';

interface RequestDeclarationModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
}

const RequestDeclarationModal: React.FC<RequestDeclarationModalProps> = ({ isOpen, onClose, student }) => {
    const { updateStudent } = useData();
    const [declarationType, setDeclarationType] = useState<DeclarationType>('enrollment');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const declarationLabels: Record<DeclarationType, string> = {
        enrollment: 'Declaração de Matrícula',
        completion: 'Declaração de Conclusão de Série',
        transfer: 'Declaração de Transferência',
        tax: 'Declaração para Imposto de Renda',
        clearance: 'Declaração de Quitação de Débitos'
    };

    const handleRequest = async () => {
        setError('');
        setIsSending(true);
        setSuccess(false);

        const newLogEntry: CommunicationLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Sistema',
            summary: `[SOLICITAÇÃO] O responsável solicitou uma "${declarationLabels[declarationType]}".`,
        };
        
        const updatedStudent: Student = {
            ...student,
            communication_log: [newLogEntry, ...student.communication_log],
        };

        try {
            await updateStudent(updatedStudent);
            setSuccess(true);
        } catch (err) {
            setError('Ocorreu um erro ao enviar a solicitação. Tente novamente.');
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError('');
        setIsSending(false);
        setDeclarationType('enrollment');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Solicitar Declaração">
            {success ? (
                <div className="text-center p-4">
                    <h3 className="text-lg font-bold text-green-600">Solicitação Enviada!</h3>
                    <p className="mt-2 text-brand-text">Sua solicitação foi enviada para a secretaria da escola.</p>
                    <p className="text-sm text-brand-text-light">Você será notificado quando o documento estiver pronto para retirada.</p>
                    <button onClick={handleClose} className="mt-4 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600">
                        Fechar
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="declaration-type" className="block text-sm font-medium text-gray-700">Selecione o tipo de declaração:</label>
                        <select
                            id="declaration-type"
                            value={declarationType}
                            onChange={e => setDeclarationType(e.target.value as DeclarationType)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            {Object.entries(declarationLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-500">
                        Após a solicitação, a secretaria da escola será notificada para preparar o documento.
                        O prazo de preparação e as instruções para retirada serão comunicados posteriormente.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button 
                            onClick={handleRequest}
                            disabled={isSending}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600 disabled:bg-slate-400"
                        >
                            {isSending ? 'Enviando...' : 'Confirmar Solicitação'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default RequestDeclarationModal;
