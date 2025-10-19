

import React from 'react';
import { Communication } from '../../types';
import Card from '../common/Card';

const ParentCommunications: React.FC<{ communications: Communication[] }> = ({ communications }) => {
    return (
         <Card>
            <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Mural de Comunicados</h1>
            <div className="space-y-4">
                {communications.map((comm) => (
                    <div key={comm.id} className="p-4 border border-slate-200/80 rounded-lg bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-brand-text-dark">{comm.title}</h3>
                                <p className="text-sm text-brand-text-light">
                                    {/* FIX: Corrected property name from `recipientGroup` to `recipient_group`. */}
                                    Enviado para: <span className="font-medium">{comm.recipient_group}</span>
                                </p>
                            </div>
                            <span className="text-sm text-brand-text-light whitespace-nowrap">
                                {/* FIX: Corrected property name from `sentDate` to `sent_date`. */}
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
    );
};

export default ParentCommunications;