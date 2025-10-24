

// FIX: Imported 'useEffect' hook from React to resolve 'Cannot find name' error.
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Card from './common/Card';
import { Settings, DeclarationType } from '../types';
import PermissionsSettings from './settings/PermissionsSettings';
import TuitionPlansEditor from './settings/TuitionPlansEditor';

type SettingsTab = 'general' | 'permissions';

const ListEditor: React.FC<{
    title: string;
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (index: number) => void;
}> = ({ title, items, onAdd, onRemove }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{title}</label>
            <div className="mt-1 space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                        <span className="text-brand-text-dark">{item}</span>
                        <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder={`Adicionar novo...`}
                />
                <button onClick={handleAdd} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-r-md hover:bg-teal-600 transition-colors">
                    +
                </button>
            </div>
        </div>
    );
};


const DeclarationTemplateEditor: React.FC<{
    templates: Record<DeclarationType, string>;
    onChange: (type: DeclarationType, value: string) => void;
}> = ({ templates, onChange }) => {
    const [expanded, setExpanded] = useState<DeclarationType | null>(null);

    const declarationLabels: Record<DeclarationType, string> = {
        enrollment: 'Declaração de Matrícula',
        completion: 'Declaração de Conclusão de Série',
        transfer: 'Declaração de Transferência',
        tax: 'Declaração para Imposto de Renda',
        clearance: 'Declaração de Quitação de Débitos'
    };
    
    const availableTags = ['{{student.name}}', '{{student.parentName}}', '{{student.cpf}}', '{{student.class}}', '{{schoolInfo.name}}', '{{schoolInfo.cnpj}}', '{{currentDate}}', '{{currentYear}}', '{{previousYear}}'];

    return (
        <div className="space-y-2">
            {Object.keys(templates).map(key => {
                const type = key as DeclarationType;
                return (
                    <div key={type} className="border rounded-md">
                        <button
                            className="w-full text-left p-3 font-medium text-brand-text-dark flex justify-between items-center"
                            onClick={() => setExpanded(expanded === type ? null : type)}
                        >
                            {declarationLabels[type]}
                            <span>{expanded === type ? '−' : '+'}</span>
                        </button>
                        {expanded === type && (
                            <div className="p-4 border-t bg-slate-50">
                                <textarea
                                    value={templates[type]}
                                    onChange={e => onChange(type, e.target.value)}
                                    rows={8}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                />
                                <div className="mt-2 text-xs text-gray-500">
                                    <p className="font-semibold">Tags disponíveis:</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                         {availableTags.map(tag => <code key={tag} className="bg-gray-200 px-2 py-1 rounded text-gray-700">{tag}</code>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


const GeneralSettings: React.FC<{
    localSettings: Settings;
    setLocalSettings: React.Dispatch<React.SetStateAction<Settings>>;
}> = ({ localSettings, setLocalSettings }) => {
    
    const handleSchoolInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            schoolInfo: { ...prev.schoolInfo, [name]: value }
        }));
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({
                    ...prev,
                    schoolInfo: { ...prev.schoolInfo, logoUrl: reader.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleListChange = (listName: 'classes' | 'staffRoles', action: 'add' | 'remove', value: string | number) => {
        setLocalSettings(prev => {
            const list = prev[listName];
            if (action === 'add' && typeof value === 'string') {
                return { ...prev, [listName]: [...list, value] };
            }
            if (action === 'remove' && typeof value === 'number') {
                return { ...prev, [listName]: list.filter((_, i) => i !== value) };
            }
            return prev;
        });
    };
    
    const handleTemplateChange = (type: DeclarationType, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            declarationTemplates: {
                ...prev.declarationTemplates,
                [type]: value,
            }
        }));
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Informações da Escola</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nome da Escola</label>
                        <input type="text" name="name" value={localSettings.schoolInfo.name} onChange={handleSchoolInfoChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" name="address" value={localSettings.schoolInfo.address} onChange={handleSchoolInfoChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input type="text" name="phone" value={localSettings.schoolInfo.phone} onChange={handleSchoolInfoChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={localSettings.schoolInfo.email} onChange={handleSchoolInfoChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <input type="text" name="cnpj" value={localSettings.schoolInfo.cnpj} onChange={handleSchoolInfoChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Identidade Visual</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Logo da Escola</label>
                    <div className="mt-2 flex items-center space-x-6">
                        <img src={localSettings.schoolInfo.logoUrl} alt="Logo preview" className="h-16 w-auto object-contain rounded-md border p-1 bg-slate-50" />
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                    </div>
                </div>
            </Card>
            
            <TuitionPlansEditor />

            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Gestão Acadêmica e Pessoal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ListEditor title="Turmas" items={localSettings.classes} onAdd={(item) => handleListChange('classes', 'add', item)} onRemove={(index) => handleListChange('classes', 'remove', index)} />
                    <ListEditor title="Cargos" items={localSettings.staffRoles} onAdd={(item) => handleListChange('staffRoles', 'add', item)} onRemove={(index) => handleListChange('staffRoles', 'remove', index)} />
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Modelos de Declaração</h2>
                <DeclarationTemplateEditor templates={localSettings.declarationTemplates} onChange={handleTemplateChange} />
            </Card>
        </div>
    );
};


const Settings: React.FC = () => {
    const { settings, updateSettings, updateRoles } = useSettings();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [statusMessage, setStatusMessage] = useState('');
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    // Update local state if the global context changes (e.g., after initial load)
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        // We separate role updates from other settings updates
        // Tuition plans are managed separately via DataContext.
        const { roles, tuitionPlans, ...otherSettings } = localSettings;
        await updateSettings(otherSettings);
        await updateRoles(roles);

        setStatusMessage('Configurações salvas com sucesso!');
        setTimeout(() => setStatusMessage(''), 3000);
    };
    
     const handleCancel = () => {
        setLocalSettings(settings); // Revert all local changes
        setStatusMessage('Alterações canceladas.');
        setTimeout(() => setStatusMessage(''), 3000);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-brand-text-dark">Configurações do Sistema</h1>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`${
                            activeTab === 'general'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Informações Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`${
                            activeTab === 'permissions'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Permissões
                    </button>
                </nav>
            </div>

            {activeTab === 'general' && (
                <GeneralSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
            )}
            {activeTab === 'permissions' && (
                 <PermissionsSettings localRoles={localSettings.roles} setLocalSettings={setLocalSettings} />
            )}

            <div className="flex justify-end items-center space-x-4 pt-4 border-t">
                {statusMessage && <p className={`font-semibold ${statusMessage.includes('canceladas') ? 'text-amber-600' : 'text-green-600'}`}>{statusMessage}</p>}
                <button onClick={handleCancel} className="bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancelar
                </button>
                <button onClick={handleSave} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-sm">
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};

export default Settings;