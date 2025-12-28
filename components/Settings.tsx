
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Card from './common/Card';
import { Settings as SettingsType, DeclarationType } from '../types';
import PermissionsSettings from './settings/PermissionsSettings';
import TuitionPlansEditor from './settings/TuitionPlansEditor';

const GeneralSettings: React.FC<{ settings: SettingsType, setSettings: (s: SettingsType) => void }> = ({ settings, setSettings }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            schoolInfo: {
                ...settings.schoolInfo,
                [name]: value
            }
        });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Informações da Escola</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Escola</label>
                    <input type="text" name="name" value={settings.schoolInfo.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                    <input type="text" name="cnpj" value={settings.schoolInfo.cnpj} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email de Contato</label>
                    <input type="email" name="email" value={settings.schoolInfo.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="text" name="phone" value={settings.schoolInfo.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <input type="text" name="address" value={settings.schoolInfo.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">URL do Logotipo</label>
                    <input type="text" name="logoUrl" value={settings.schoolInfo.logoUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="https://..." />
                </div>
            </div>
        </Card>
    );
};

const AcademicSettings: React.FC<{ settings: SettingsType, setSettings: (s: SettingsType) => void }> = ({ settings, setSettings }) => {
    const [newClass, setNewClass] = useState('');

    const addClass = () => {
        if (newClass && !settings.classes.includes(newClass)) {
            setSettings({ ...settings, classes: [...settings.classes, newClass] });
            setNewClass('');
        }
    };

    const removeClass = (cls: string) => {
        setSettings({ ...settings, classes: settings.classes.filter(c => c !== cls) });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Configurações Acadêmicas</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turmas Cadastradas</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {settings.classes.map(cls => (
                        <span key={cls} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-primary/10 text-brand-primary">
                            {cls}
                            <button onClick={() => removeClass(cls)} className="ml-2 text-brand-primary hover:text-sky-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input type="text" value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="Nova Turma (ex: 1º Ano A)" className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    <button onClick={addClass} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors">Adicionar</button>
                </div>
            </div>
        </Card>
    );
};

const TemplateSettings: React.FC<{ settings: SettingsType, setSettings: (s: SettingsType) => void }> = ({ settings, setSettings }) => {
    const handleTemplateChange = (type: DeclarationType, value: string) => {
        setSettings({
            ...settings,
            declarationTemplates: {
                ...settings.declarationTemplates,
                [type]: value
            }
        });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-text-dark border-b pb-2">Modelos de Declarações</h2>
            <p className="text-sm text-brand-text-light mb-4">Utilize as tags: <code>{"{{student.name}}"}</code>, <code>{"{{student.parentName}}"}</code>, <code>{"{{student.cpf}}"}</code>, <code>{"{{student.class}}"}</code>, <code>{"{{schoolInfo.name}}"}</code>, <code>{"{{schoolInfo.cnpj}}"}</code>, <code>{"{{currentDate}}"}</code>, <code>{"{{currentYear}}"}</code>, <code>{"{{previousYear}}"}</code></p>
            <div className="space-y-6">
                {(Object.keys(settings.declarationTemplates) as DeclarationType[]).map(type => (
                    <div key={type}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <textarea
                            value={settings.declarationTemplates[type]}
                            onChange={e => handleTemplateChange(type, e.target.value)}
                            rows={6}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm font-serif"
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
};

const Settings: React.FC = () => {
    const { settings, updateSettings, updateRoles } = useSettings();
    const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
    const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'financial' | 'templates' | 'permissions'>('general');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await updateSettings({
                schoolInfo: localSettings.schoolInfo,
                classes: localSettings.classes,
                staffRoles: localSettings.staffRoles,
                declarationTemplates: localSettings.declarationTemplates
            });
            await updateRoles(localSettings.roles);
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="border-b border-gray-200 w-full sm:w-auto">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Geral</button>
                        <button onClick={() => setActiveTab('academic')} className={`${activeTab === 'academic' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Acadêmico</button>
                        <button onClick={() => setActiveTab('financial')} className={`${activeTab === 'financial' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Financeiro</button>
                        <button onClick={() => setActiveTab('templates')} className={`${activeTab === 'templates' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Documentos</button>
                        <button onClick={() => setActiveTab('permissions')} className={`${activeTab === 'permissions' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Permissões</button>
                    </nav>
                </div>
                <button onClick={handleSaveAll} disabled={isSaving} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600 transition-colors shadow-md disabled:bg-slate-400">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'general' && <GeneralSettings settings={localSettings} setSettings={setLocalSettings} />}
                {activeTab === 'academic' && <AcademicSettings settings={localSettings} setSettings={setLocalSettings} />}
                {activeTab === 'financial' && <TuitionPlansEditor />}
                {activeTab === 'templates' && <TemplateSettings settings={localSettings} setSettings={setLocalSettings} />}
                {activeTab === 'permissions' && <PermissionsSettings localRoles={localSettings.roles} setLocalSettings={setLocalSettings} />}
            </div>
        </div>
    );
};

export default Settings;
