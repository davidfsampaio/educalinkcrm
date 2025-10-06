
import React from 'react';
// FIX: Corrected import path for types.
import { Communication } from '../../types';
import Modal from '../common/Modal';
import { useSettings } from '../../contexts/SettingsContext';

interface CommunicationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    communication: Communication;
}

const CommunicationDetailModal: React.FC<CommunicationDetailModalProps> = ({ isOpen, onClose, communication }) => {
    const { settings } = useSettings();
    const { schoolInfo } = settings;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Comunicado</title>
                        <style>
                            body { font-family: sans-serif; margin: 2rem; color: #0f172a; }
                            .header { display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 2rem; }
                            .header img { max-height: 70px; margin-right: 1.5rem; }
                            .header-info h1 { font-size: 1.5rem; margin: 0; }
                            .header-info p { margin: 0; font-size: 0.9rem; color: #475569; }
                            .comm-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; }
                            .comm-meta { font-size: 0.9rem; color: #475569; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
                            .comm-content { white-space: pre-wrap; font-family: sans-serif; font-size: 1rem; line-height: 1.6; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            ${schoolInfo.logoUrl ? `<img src="${schoolInfo.logoUrl}" alt="Logo da Escola" />` : ''}
                            <div class="header-info">
                                <h1>${schoolInfo.name}</h1>
                                <p>${schoolInfo.address}</p>
                            </div>
                        </div>
                        <h2 class="comm-title">${communication.title}</h2>
                        <div class="comm-meta">
                            <p><strong>Para:</strong> ${communication.recipientGroup}</p>
                            <p><strong>Enviado em:</strong> ${new Date(communication.sentDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="comm-content">${communication.content.replace(/\n/g, '<br>')}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Visualizar Comunicado" size="3xl">
            <div>
                 {/* Header */}
                <div className="flex items-center border-b pb-4 mb-4">
                    {schoolInfo.logoUrl && <img src={schoolInfo.logoUrl} alt="Logo da Escola" className="h-16 w-auto object-contain mr-4"/>}
                    <div>
                        <h3 className="text-lg font-bold text-brand-text-dark">{schoolInfo.name}</h3>
                        <p className="text-sm text-brand-text-light">{schoolInfo.address}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text-dark">{communication.title}</h2>
                        <p className="text-sm text-brand-text-light">
                            Enviado em {new Date(communication.sentDate).toLocaleDateString('pt-BR')} para <span className="font-semibold">{communication.recipientGroup}</span>
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-brand-text whitespace-pre-wrap">{communication.content}</p>
                    </div>
                </div>

                 {/* Footer */}
                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Fechar
                    </button>
                    <button onClick={handlePrint} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">
                        Imprimir
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default CommunicationDetailModal;
