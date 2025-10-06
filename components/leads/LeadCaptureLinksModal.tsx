import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { LeadCaptureCampaign } from '../../types';
import CreateLeadCaptureLinkModal from './CreateLeadCaptureLinkModal';
import ClipboardIcon from '../common/ClipboardIcon';

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

interface LeadCaptureLinksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LeadCaptureLinksModal: React.FC<LeadCaptureLinksModalProps> = ({ isOpen, onClose }) => {
    const { leadCaptureCampaigns, addLeadCaptureCampaign } = useData();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const handleCreateCampaign = (campaignName: string) => {
        const campaignId = `campaign-${Date.now()}`;
        const newCampaign: LeadCaptureCampaign = {
            id: campaignId,
            name: campaignName,
            publicUrl: `/#/capture/${campaignId}`,
            createdAt: new Date().toISOString(),
            leadsCaptured: 0,
        };
        addLeadCaptureCampaign(newCampaign);
        setCreateModalOpen(false);
    };

    const handleCopyLink = (url: string) => {
        const fullUrl = `${window.location.origin}${window.location.pathname}${url}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopiedLink(url);
            setTimeout(() => setCopiedLink(null), 2000);
        });
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Links Públicos de Captura de Leads" size="4xl">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-brand-text">Use estes links em suas campanhas de marketing para capturar novos leads automaticamente.</p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Criar Novo Link
                        </button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads Capturados</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Público</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leadCaptureCampaigns.length > 0 ? leadCaptureCampaigns.map(campaign => (
                                    <tr key={campaign.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-brand-text-dark">{campaign.name}</div>
                                            <div className="text-xs text-slate-500">Criado em: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-brand-text-dark">{campaign.leadsCaptured}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <input type="text" readOnly value={`${window.location.origin}${window.location.pathname}${campaign.publicUrl}`} className="w-full bg-slate-100 border-slate-300 rounded-l-md text-sm p-2 font-mono" />
                                                <button 
                                                    onClick={() => handleCopyLink(campaign.publicUrl)}
                                                    className="bg-slate-200 p-2 rounded-r-md hover:bg-slate-300"
                                                >
                                                    <ClipboardIcon className={`w-5 h-5 ${copiedLink === campaign.publicUrl ? 'text-green-600' : 'text-slate-600'}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-brand-text-light">
                                            Nenhum link de captura foi criado ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            <CreateLeadCaptureLinkModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateCampaign}
            />
        </>
    );
};

export default LeadCaptureLinksModal;