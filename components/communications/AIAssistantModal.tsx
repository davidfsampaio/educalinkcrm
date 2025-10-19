import React, { useState } from 'react';
import Modal from '../common/Modal';
import { generateText } from '../../services/geminiService';

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTextGenerated: (text: string) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onTextGenerated }) => {
    const [topic, setTopic] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic) {
            setError('Por favor, insira um tópico.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedText('');

        const prompt = `Você é um assistente de comunicação para uma escola. Sua tarefa é escrever um comunicado amigável, claro e profissional para os pais dos alunos.
        O comunicado deve ser em Português do Brasil.
        Tópico do comunicado: "${topic}"
        
        Escreva o comunicado abaixo:`;

        try {
            const result = await generateText(prompt);
            // Check for known error strings from the service
            if (result.startsWith('O Serviço de IA não está configurado') || result.startsWith('Erro do Gemini') || result.startsWith('Ocorreu um erro desconhecido')) {
                 setError(result);
            } else {
                setGeneratedText(result);
            }
        } catch (err) {
            setError('Ocorreu um erro ao gerar o texto. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseText = () => {
        if (generatedText) {
            onTextGenerated(generatedText);
        }
    };

    const handleClose = () => {
        setTopic('');
        setGeneratedText('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Assistente de Comunicação IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Qual o tópico do comunicado?
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="topic"
                            id="topic"
                            className="shadow-sm focus:ring-brand-primary focus:border-brand-primary block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Ex: Lembrete sobre a Festa Junina"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Comunicado'}
                </button>

                {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                {generatedText && (
                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900">Resultado Gerado:</h3>
                        <div className="mt-2 p-4 bg-slate-50 border rounded-md whitespace-pre-wrap font-sans text-brand-text max-h-60 overflow-y-auto">
                            {generatedText}
                        </div>
                         <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleUseText}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                            >
                                Usar este texto
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIAssistantModal;
