import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { Lead, LeadStatus } from '../types';

const PublicLeadCapturePage: React.FC = () => {
    const { addLead, loading } = useData();
    const { settings } = useSettings();
    const [parentName, setParentName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [studentName, setStudentName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { schoolInfo } = settings;
    const campaignId = window.location.pathname.split('/').pop();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentName || !email || !phone || !studentName) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        const newLead: Omit<Lead, 'id'> = {
            name: `Lead de ${parentName} (Aluno: ${studentName})`,
            parentName,
            contact: `${phone} / ${email}`,
            status: LeadStatus.New,
            interestDate: new Date().toISOString().split('T')[0],
            notes: `Lead capturado através do formulário público da campanha ID: ${campaignId}.`,
            tasks: [{ id: 1, description: 'Realizar primeiro contato', isCompleted: false }],
            isConverted: false,
            requiredDocuments: [],
            communicationLog: [],
        };

        // Simulate network delay
        setTimeout(() => {
            addLead(newLead, campaignId);
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1000);
    };

    if (loading) {
         return <div className="flex h-screen w-screen items-center justify-center bg-slate-100"><p>Carregando...</p></div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8">
                {schoolInfo.logoUrl && <img src={schoolInfo.logoUrl} alt="Logo da Escola" className="h-20 w-auto mx-auto mb-4" />}
                <h1 className="text-3xl font-bold text-brand-text-dark">{schoolInfo.name}</h1>
                <p className="text-lg text-brand-text">Formulário de Interesse de Matrícula</p>
            </header>
            
            <main className="w-full max-w-lg">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <h2 className="text-2xl font-bold text-brand-secondary mb-2">Obrigado!</h2>
                            <p className="text-brand-text">Recebemos suas informações com sucesso.</p>
                            <p className="text-brand-text-light mt-2">Nossa equipe entrará em contato em breve para dar os próximos passos.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-xl font-semibold text-brand-text-dark text-center">Preencha os dados abaixo</h2>
                            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                            <div>
                                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Nome do Responsável</label>
                                <input type="text" id="parentName" value={parentName} onChange={e => setParentName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Nome do Aluno(a)</label>
                                <input type="text" id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 font-semibold rounded-lg text-white bg-brand-primary hover:bg-sky-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-slate-400"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Interesse'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <footer className="text-center mt-8 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} {schoolInfo.name}. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default PublicLeadCapturePage;
