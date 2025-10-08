

import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types.
import { IndividualAgendaItem, IndividualAgendaItemType } from '../../../types';


const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Trash2Icon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

interface IndividualAgendaTabProps {
    agendaItems: IndividualAgendaItem[];
    // FIX: Made onAddItem optional to support read-only views like the parent portal.
    onAddItem?: (itemData: { type: IndividualAgendaItemType; selections: string[]; description: string }) => void;
    onEdit?: (item: IndividualAgendaItem) => void;
    onDelete?: (itemId: number) => void;
}

const getIconForType = (type: IndividualAgendaItemType) => {
    switch (type) {
        case IndividualAgendaItemType.Alimentacao: return '🍎';
        case IndividualAgendaItemType.Sono: return '😴';
        case IndividualAgendaItemType.Higiene: return '🧼';
        case IndividualAgendaItemType.Medicacao: return '💊';
        case IndividualAgendaItemType.Disposicao: return '😊';
        case IndividualAgendaItemType.Atividade: return '🎨';
        case IndividualAgendaItemType.Observacao: return '📝';
        default: return '📌';
    }
};

const predefinedOptions: Partial<Record<IndividualAgendaItemType, string[]>> = {
    [IndividualAgendaItemType.Alimentacao]: ['Comeu tudo', 'Comeu bem', 'Comeu pouco', 'Recusou'],
    [IndividualAgendaItemType.Sono]: ['Dormiu bem', 'Sono agitado', 'Não dormiu', 'Despertou várias vezes'],
    [IndividualAgendaItemType.Higiene]: ['Troca de fralda (xixi)', 'Troca de fralda (cocô)', 'Usou o banheiro', 'Escovou os dentes', 'Tomou banho'],
    [IndividualAgendaItemType.Medicacao]: ['Medicação administrada', 'Recusou medicação', 'Apresentou reação'],
    [IndividualAgendaItemType.Disposicao]: ['Feliz e ativo(a)', 'Calmo(a) e tranquilo(a)', 'Choroso(a) / Irritado(a)', 'Sonolento(a)'],
};


const IndividualAgendaTab: React.FC<IndividualAgendaTabProps> = ({ agendaItems, onAddItem, onEdit, onDelete }) => {
    const [type, setType] = useState<IndividualAgendaItemType>(IndividualAgendaItemType.Observacao);
    const [description, setDescription] = useState('');
    const [selections, setSelections] = useState<string[]>([]);
    const currentOptions = predefinedOptions[type] || [];

    useEffect(() => {
        setSelections([]);
    }, [type]);

    const handleSelectionChange = (option: string) => {
        setSelections(prev =>
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selections.length === 0 && !description.trim()) {
            return;
        }
        // FIX: Check if onAddItem is provided before calling it.
        onAddItem?.({ type, selections, description });
        setDescription('');
        setSelections([]);
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

                    {currentOptions.length > 0 && (
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Opções</label>
                             <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {currentOptions.map(option => (
                                    <label key={option} className="flex items-center space-x-2 p-2 bg-white rounded-md border has-[:checked]:bg-sky-50 has-[:checked]:border-brand-primary cursor-pointer transition-all duration-200">
                                        <input
                                            type="checkbox"
                                            checked={selections.includes(option)}
                                            onChange={() => handleSelectionChange(option)}
                                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        />
                                        <span className="text-sm text-brand-text-dark">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="agenda-item-description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                        <textarea
                            id="agenda-item-description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            placeholder="Adicione observações ou detalhes adicionais aqui..."
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
                                <div className="text-2xl mr-4 pt-1">{getIconForType(item.type)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-brand-text-dark">{item.type}</h4>
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                {' - '}
                                                Criado às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
            
                                        {onEdit && onDelete && (
                                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                                <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-brand-primary" title="Editar">
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500" title="Excluir">
                                                    <Trash2Icon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-2">
                                        {item.selections && item.selections.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.selections.map((selection, index) => (
                                                    <span key={index} className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full">
                                                        {selection}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {item.description && (
                                            <p className={`text-brand-text-dark ${item.selections && item.selections.length > 0 ? 'mt-3 pt-3 border-t border-slate-200' : 'mt-2'}`}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
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