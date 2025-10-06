
import React, { useState } from 'react';
import Card from './common/Card';
import { useData } from '../contexts/DataContext';
import { Student, DeclarationType } from '../types';
import { generateDeclaration } from '../services/declarationService';
import { useSettings } from '../contexts/SettingsContext';

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
);

const Declarations: React.FC = () => {
    const { students, loading: studentsLoading } = useData();
    const { settings } = useSettings();
    const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
    const [declarationType, setDeclarationType] = useState<DeclarationType>('enrollment');
    const [generatedText, setGeneratedText] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = () => {
        if (!selectedStudentId) {
            setError('Por favor, selecione um aluno.');
            return;
        }
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) {
            setError('Aluno não encontrado.');
            return;
        }

        setError('');
        const result = generateDeclaration(student, declarationType, settings);
        setGeneratedText(result);
    };
    
    const handlePrint = () => {
        const student = students.find(s => s.id === selectedStudentId);
        if (!generatedText || !student) return;

        const parts = generatedText.split('\n\n');
        const title = parts.length > 0 ? parts[0] : '';
        const body = parts.length > 1 ? parts.slice(1).join('\n\n') : '';

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const printContent = `
                <html>
                    <head>
                        <title>Declaração - ${student.name}</title>
                        <style>
                            body { font-family: serif; margin: 2rem; color: #0f172a; line-height: 1.6; }
                            .header { text-align: center; margin-bottom: 3rem; }
                            .header img { max-height: 80px; margin-bottom: 1rem; }
                            .header h1 { font-size: 1.5rem; margin: 0; }
                            .header p { margin: 0; font-size: 0.9rem; color: #475569; }
                            .declaration-title { text-align: center; font-weight: bold; font-size: 1.2rem; margin-bottom: 2.5rem; text-transform: uppercase; }
                            .declaration-body { white-space: pre-wrap; font-family: serif; font-size: 1.1rem; text-align: justify; }
                            .footer { margin-top: 4rem; }
                            .footer-date { text-align: center; margin-bottom: 2rem; }
                            .signature { text-align: center; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            ${settings.schoolInfo.logoUrl ? `<img id="school-logo-print" src="${settings.schoolInfo.logoUrl}" alt="Logo da Escola" />` : ''}
                            <h1>${settings.schoolInfo.name}</h1>
                            <p>${settings.schoolInfo.address}</p>
                            <p>CNPJ: ${settings.schoolInfo.cnpj}</p>
                        </div>
                        
                        <h2 class="declaration-title">${title}</h2>
                        <div class="declaration-body">${body.replace(/\n/g, '<br>')}</div>

                        <div class="footer">
                            <p class="footer-date">${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                            <div class="signature">
                                <p>_________________________________________</p>
                                <p>${settings.schoolInfo.name}</p>
                                <p>Secretaria</p>
                            </div>
                        </div>
                    </body>
                </html>
            `;
            printWindow.document.write(printContent);
            printWindow.document.close();

            const triggerPrint = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };

            const logoImg = printWindow.document.getElementById('school-logo-print') as HTMLImageElement;

            if (logoImg) {
                if (logoImg.complete) {
                    triggerPrint();
                } else {
                    logoImg.onload = triggerPrint;
                    logoImg.onerror = () => {
                        console.error("Logo failed to load for printing.");
                        triggerPrint(); // Print anyway
                    };
                }
            } else {
                triggerPrint();
            }
        }
    };


    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-brand-text-dark mb-4">Gerador de Declarações</h2>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="student-select" className="block text-sm font-medium text-gray-700">Selecione o Aluno</label>
                        <select
                            id="student-select"
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            disabled={studentsLoading}
                        >
                            <option value="">{studentsLoading ? 'Carregando...' : 'Selecione um aluno'}</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="declaration-type" className="block text-sm font-medium text-gray-700">Tipo de Declaração</label>
                        <select
                            id="declaration-type"
                            value={declarationType}
                            onChange={e => setDeclarationType(e.target.value as DeclarationType)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="enrollment">Declaração de Matrícula</option>
                            <option value="completion">Declaração de Conclusão de Série</option>
                            <option value="transfer">Declaração de Transferência</option>
                            <option value="tax">Declaração para Imposto de Renda</option>
                            <option value="clearance">Declaração de Quitação de Débitos</option>
                        </select>
                    </div>
                </div>
                 <div className="mt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedStudentId}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400"
                    >
                        Gerar Declaração
                    </button>
                </div>
            </Card>

            {generatedText && (
                 <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-brand-text-dark">Resultado</h3>
                         <button
                            onClick={handlePrint}
                            className="flex items-center bg-brand-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-teal-500 transition-colors duration-300 shadow-sm text-sm"
                        >
                            <PrintIcon className="w-4 h-4 mr-2" />
                            Imprimir
                        </button>
                    </div>
                    <textarea
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                        rows={15}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 font-serif text-brand-text-dark"
                    />
                </Card>
            )}

        </div>
    );
};

export default Declarations;
