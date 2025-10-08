
import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { IndividualAgendaItem, IndividualAgendaItemType } from '../../../types';

interface EditIndividualAgendaItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: IndividualAgendaItem;
    onUpdate: (item: IndividualAgendaItem) => void;
}

const predefinedOptions: Partial<Record<IndividualAgendaItemType, string[]>> = {
    [IndividualAgendaItemType.Alimentacao]: ['Comeu tudo', 'Comeu bem', 'Comeu pouco', 'Recusou'],
    [IndividualAgendaItemType.Sono]: ['Dormiu bem', 'Sono agitado', 'Não dormiu', 'Despertou várias vezes'],
    [IndividualAgendaItemType.Higiene]: ['Troca de fralda (xixi)', 'Troca de fralda (cocô)', 'Usou o banheiro', 'Escovou os dentes', 'Tomou banho'],
    [IndividualAgendaItemType.Medicacao]: ['Medicação administrada', 'Recusou medicação', 'Apresentou reação'],
    [IndividualAgendaItemType.Disposicao]: ['Feliz e ativo(a)', 'Calmo(a) e tranquilo(a)', 'Choroso(a) / Irritado(a)', 'Sonolento(a)'],
};

const EditIndividualAgendaItemModal: React.FC<EditIndividualAgendaItemModalProps> = ({ isOpen, onClose, item, onUpdate }) => {
    const [type, setType] = useState<IndividualAgendaItemType>(item.type);
    const [description, setDescription] = useState(item.description);
    const [selections, setSelections] = useState<string[]>(item.selections || []);
    const currentOptions = predefinedOptions[type] || [];
    
    useEffect(() => {
        if (item) {
            setType(item.type);
            setDescription(item.description);
            setSelections(item.selections || []);
        }
    }, [item]);

    // When type changes, clear selections
    useEffect(() => {
        if (item && type !== item.type) {
           setSelections([]);
        }
    }, [type, item]);

    const handleSelectionChange = (option: string) => {
        setSelections(prev =>
            // FIX: Corrected the undefined variable 'i' to 'option' when adding an element.
            prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selections.length === 0 && !description.trim()) {
            // Prevent saving an empty entry
            return;
        }

        onUpdate({
            ...item, // Preserve id, date, createdAt, isSent
            type,
            selections,
            description,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Registro da Agenda">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-agenda-item-type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        id="edit-agenda-item-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as IndividualAgendaItemType)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                                <label key={option} className="flex items-center space-x-2 p-2 bg-white rounded-md border has-[:checked]:bg-sky-50 has-[:checked]:border-brand-primary cursor-pointer">
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
                    <label htmlFor="edit-agenda-item-description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                    <textarea
                        id="edit-agenda-item-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        placeholder="Adicione observações..."
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditIndividualAgendaItemModal;
