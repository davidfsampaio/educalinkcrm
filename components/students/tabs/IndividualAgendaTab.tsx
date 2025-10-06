
import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { IndividualAgendaItem, IndividualAgendaItemType } from '../../../types';


interface IndividualAgendaTabProps {
    agendaItems: IndividualAgendaItem[];
    // FIX: Made onAddItem optional to support read-only views like the parent portal.
    onAddItem?: (itemData: { type: IndividualAgendaItemType; description: string }) => void;
}

const getIconForType = (type: IndividualAgendaItemType) => {
    switch (type) {
        case IndividualAgendaItemType.Alimentacao: return '🍎';
        case IndividualAgendaItemType.Sono: return '😴';
        case IndividualAgendaItemType.Higiene: return '🧼';
        case IndividualAgendaItemType.Atividade: return '🎨';
        case IndividualAgendaItemType.Observacao: return '📝';
        default: return '📌';
    }
};

const IndividualAgendaTab: React.FC<IndividualAgendaTabProps> = ({ agendaItems, onAddItem }) => {
    const [type, setType] = useState<IndividualAgendaItemType>(IndividualAgendaItemType.Observacao);
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            return;
        }
        // FIX: Check if onAddItem is provided before calling it.
        onAddItem?.({ type, description });
        setDescription('');
        setType(IndividualAgendaItemType.Observacao);
    };

    return (
        <div className="space-y-6">
            {/* FIX: Conditionally render the form only if onAddItem is provided. */}
            {onAddItem && (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-3">
                    <h4 className="text-md font-bold text-brand-text-dark">Adicionar Novo Registro</h4>
                    <div>
                        <label htmlFor="agenda-item-type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            id="agenda-item-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as IndividualAgendaItemType)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            {Object.values(IndividualAgendaItemType).map(itemType => (
                                <option key={itemType} value={itemType}>{itemType}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="agenda-item-description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            id="agenda-item-description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            placeholder="Descreva o que aconteceu..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Salvar na Agenda
                        </button>
                    </div>
                </form>
            )}

            <div className={onAddItem ? "pt-6 border-t border-slate-200" : ""}>
                {onAddItem && <h4 className="text-md font-bold text-brand-text-dark mb-4">Histórico Recente</h4>}
                <div className="space-y-4">
                    {agendaItems.length === 0 ? (
                        <p className="text-brand-text-dark text-center py-4">Nenhum item na agenda individual.</p>
                    ) : (
                        agendaItems.map((item) => (
                            <div key={item.id} className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                                <div className="text-2xl mr-4">{getIconForType(item.type)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-brand-text-dark">{item.type}</h4>
                                        <span className="text-sm text-brand-text-dark">{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                    </div>
                                    <p className="text-brand-text-dark">{item.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default IndividualAgendaTab;
