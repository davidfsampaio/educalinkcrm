import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import { generateText } from '../../services/geminiService';

// FIX: Corrected the global window.aistudio type definition to use a named interface `AIStudio` to resolve type conflicts.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" /><path d="M5 21L6 17" /><path d="M19 21L18 17" /><path d="M3 12L7 11" /><path d="M21 12L17 11" /></svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

interface AIToolProps {
    onApiKeyError: () => void;
}

// Tool 1: Communication Generator
const CommunicationGenerator: React.FC<AIToolProps> = ({ onApiKeyError }) => {
    const [topic, setTopic] = useState('Festa Junina da escola');
    const [tone, setTone] = useState('Amigável');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setResult('');
        setError('');
        const prompt = `Você é um assistente de comunicação para uma escola. Sua tarefa é escrever um comunicado claro e profissional para os pais dos alunos em Português do Brasil.
        - Tópico: "${topic}"
        - Tom: ${tone}
        
        Escreva o comunicado abaixo:`;
        const generated = await generateText(prompt);
        if (generated === 'API_KEY_INVALID') {
            onApiKeyError();
        } else if (generated.startsWith('Erro') || generated.startsWith('O Serviço')) {
            setError(generated);
        } else {
            setResult(generated);
        }
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 text-brand-text-dark flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" /> Gerador de Comunicados</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tópico</label>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tom</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option>Amigável</option>
                        <option>Formal</option>
                        <option>Urgente</option>
                        <option>Informativo</option>
                    </select>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-600 disabled:bg-slate-400">
                    {isLoading ? <LoadingSpinner /> : 'Gerar Texto'}
                </button>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {result && (
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <h4 className="text-md font-semibold">Resultado:</h4>
                            <button onClick={handleCopy} className="flex items-center text-sm font-medium text-brand-primary hover:text-sky-700">
                                <ClipboardIcon className="w-4 h-4 mr-1" /> {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                        <textarea readOnly value={result} rows={8} className="mt-2 w-full bg-slate-50 p-2 border rounded-md font-sans text-brand-text" />
                    </div>
                )}
            </div>
        </Card>
    );
};

// Tool 2: Sentiment Analysis
const SentimentAnalysis: React.FC<AIToolProps> = ({ onApiKeyError }) => {
    const [text, setText] = useState('Estou um pouco preocupado com o desenvolvimento do meu filho na matemática. Ele parece estar com dificuldades. Podemos conversar?');
    const [result, setResult] = useState<{ sentiment?: string; summary?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        setIsLoading(true);
        setResult(null);
        setError('');
        const prompt = `Analise o sentimento da seguinte mensagem de um pai/mãe de aluno e resuma os pontos principais. Responda em formato JSON com as chaves "sentiment" (pode ser "Positivo", "Negativo", ou "Neutro") e "summary".
        Mensagem: "${text}"`;
        const generated = await generateText(prompt);
        if (generated === 'API_KEY_INVALID') {
            onApiKeyError();
            setIsLoading(false);
            return;
        }

        try {
            const jsonString = generated.replace(/```json\n?|\n?```/g, '');
            const parsed = JSON.parse(jsonString);
            setResult(parsed);
        } catch (e) {
            console.error("Failed to parse sentiment analysis JSON:", e, "Raw response:", generated);
            setError('Não foi possível analisar a resposta da IA.');
            setResult(null);
        }
        setIsLoading(false);
    };
    
    const sentimentClasses: Record<string, string> = {
        'Positivo': 'bg-green-100 text-green-800',
        'Negativo': 'bg-red-100 text-red-800',
        'Neutro': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 text-brand-text-dark flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" /> Análise de Sentimento</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cole a mensagem do responsável</label>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-600 disabled:bg-slate-400">
                    {isLoading ? <LoadingSpinner /> : 'Analisar Mensagem'}
                </button>
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {result && (
                    <div className="pt-4 border-t space-y-2">
                        <h4 className="text-md font-semibold">Resultado:</h4>
                        <p><strong>Sentimento:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${sentimentClasses[result.sentiment || ''] || 'bg-gray-100 text-gray-800'}`}>{result.sentiment || 'N/A'}</span></p>
                        <p><strong>Resumo:</strong></p>
                        <p className="p-2 bg-slate-50 border rounded-md">{result.summary || 'N/A'}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Tool 3: Activity Brainstormer
const ActivityBrainstormer: React.FC<AIToolProps> = ({ onApiKeyError }) => {
    const [age, setAge] = useState('3-4 anos');
    const [theme, setTheme] = useState('Natureza');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setResult('');
        setError('');
        const prompt = `Gere 3 ideias de atividades educacionais para crianças de ${age} com o tema "${theme}".
        Para cada atividade, inclua:
        - Nome da Atividade
        - Materiais Necessários
        - Passo a passo simples
        
        Formate a resposta de forma clara e organizada.`;
        const generated = await generateText(prompt);
         if (generated === 'API_KEY_INVALID') {
            onApiKeyError();
        } else if (generated.startsWith('Erro') || generated.startsWith('O Serviço')) {
            setError(generated);
        } else {
            setResult(generated);
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 text-brand-text-dark flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" /> Brainstorm de Atividades</h3>
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Faixa Etária</label>
                        <select value={age} onChange={e => setAge(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                            <option>2-3 anos</option>
                            <option>3-4 anos</option>
                            <option>4-5 anos</option>
                            <option>5-6 anos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tema</label>
                        <input type="text" value={theme} onChange={e => setTheme(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-600 disabled:bg-slate-400">
                    {isLoading ? <LoadingSpinner /> : 'Gerar Ideias'}
                </button>
                 {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {result && (
                    <div className="pt-4 border-t">
                        <h4 className="text-md font-semibold">Ideias Geradas:</h4>
                        <div className="mt-2 w-full bg-slate-50 p-3 border rounded-md whitespace-pre-wrap font-sans text-brand-text max-h-60 overflow-y-auto">{result}</div>
                    </div>
                )}
            </div>
        </Card>
    );
};

const AITools: React.FC = () => {
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [checkingApiKey, setCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyReady(hasKey);
            }
            setCheckingApiKey(false);
        };
        checkKey();
    }, []);

    const handleActivateAI = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
        }
    };
    
    const handleApiKeyError = () => {
        setApiKeyReady(false);
        alert("Sua chave de API parece inválida ou foi revogada. Por favor, selecione uma chave de API válida para continuar.");
        if (window.aistudio) {
            window.aistudio.openSelectKey().then(() => {
                // Optimistic update after user closes dialog
                setApiKeyReady(true);
            });
        }
    }

    if (checkingApiKey) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-brand-text">Verificando configuração da IA...</p>
            </div>
        );
    }

    if (!apiKeyReady) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center max-w-lg mx-auto">
                    <SparklesIcon className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-brand-text-dark">Ativar Recursos de IA</h2>
                    <p className="mt-2 text-brand-text">Para usar as ferramentas de Inteligência Artificial, você precisa selecionar uma chave de API do Google AI Studio.</p>
                    <p className="mt-2 text-sm text-slate-500">Isso é necessário para autorizar o uso dos modelos de IA. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline text-brand-primary">Saiba mais sobre faturamento.</a></p>
                    <button onClick={handleActivateAI} className="mt-6 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 transition-colors">
                        Ativar IA
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-brand-text-dark">Central de Inteligência Artificial</h1>
                <p className="mt-2 text-lg text-brand-text-light">Ferramentas para otimizar a gestão e comunicação da sua escola.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <CommunicationGenerator onApiKeyError={handleApiKeyError} />
                <div className="space-y-6">
                    <SentimentAnalysis onApiKeyError={handleApiKeyError} />
                    <ActivityBrainstormer onApiKeyError={handleApiKeyError} />
                </div>
            </div>
        </div>
    );
};

export default AITools;
