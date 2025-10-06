import { Permission, Role } from '../types';

export const allPermissions: { name: Permission, label: string, module: string }[] = [
  // Dashboard
  { name: 'view_dashboard', label: 'Ver Dashboard', module: 'Dashboard' },
  // Students
  { name: 'view_students', label: 'Ver Alunos', module: 'Alunos' },
  { name: 'create_students', label: 'Criar Alunos', module: 'Alunos' },
  { name: 'edit_students', label: 'Editar Alunos', module: 'Alunos' },
  // Staff
  { name: 'view_staff', label: 'Ver Funcionários', module: 'Funcionários' },
  { name: 'create_staff', label: 'Criar Funcionários', module: 'Funcionários' },
  { name: 'edit_staff', label: 'Editar Funcionários', module: 'Funcionários' },
  // Financials
  { name: 'view_financials', label: 'Ver Financeiro', module: 'Financeiro' },
  { name: 'create_invoices', label: 'Criar Faturas', module: 'Financeiro' },
  { name: 'edit_invoices', label: 'Editar Faturas', module: 'Financeiro' },
  { name: 'delete_invoices', label: 'Excluir Faturas', module: 'Financeiro' },
  { name: 'manage_revenues', label: 'Gerenciar Receitas', module: 'Financeiro' },
  { name: 'manage_expenses', label: 'Gerenciar Despesas', module: 'Financeiro' },
  // Leads
  { name: 'view_leads', label: 'Ver Admissões', module: 'Admissões' },
  { name: 'create_leads', label: 'Criar Leads', module: 'Admissões' },
  { name: 'edit_leads', label: 'Editar Leads', module: 'Admissões' },
  { name: 'manage_lead_forms', label: 'Gerenciar Links de Captura', module: 'Admissões' },
  // Agenda
  { name: 'view_agenda', label: 'Ver Agenda', module: 'Agenda' },
  { name: 'create_agenda_items', label: 'Criar Itens na Agenda', module: 'Agenda' },
  // Communications
  { name: 'view_communications', label: 'Ver Comunicações', module: 'Comunicação' },
  { name: 'send_communications', label: 'Enviar Comunicações', module: 'Comunicação' },
  // Declarations
  { name: 'view_declarations', label: 'Ver Declarações', module: 'Declarações' },
  { name: 'generate_declarations', label: 'Gerar Declarações', module: 'Declarações' },
  // Gallery
  { name: 'view_gallery', label: 'Ver Mural de Fotos', module: 'Mural de Fotos' },
  { name: 'manage_gallery', label: 'Gerenciar Mural de Fotos', module: 'Mural de Fotos' },
  // Library
  { name: 'view_library', label: 'Ver Biblioteca', module: 'Biblioteca' },
  { name: 'manage_library', label: 'Gerenciar Biblioteca', module: 'Biblioteca' },
  // Reports
  { name: 'view_reports', label: 'Ver Relatórios', module: 'Relatórios' },
  // Admin
  { name: 'view_users', label: 'Ver Usuários', module: 'Admin' },
  { name: 'manage_users', label: 'Gerenciar Usuários', module: 'Admin' },
  { name: 'view_settings', label: 'Ver Configurações', module: 'Admin' },
  { name: 'manage_settings', label: 'Gerenciar Configurações', module: 'Admin' },
  { name: 'manage_permissions', label: 'Gerenciar Permissões', module: 'Admin' },
];


export const initialRoles: Role[] = [
    {
        name: 'Admin',
        permissions: allPermissions.map(p => p.name), // Admin has all permissions
    },
    {
        name: 'Secretário(a)',
        permissions: [
            'view_dashboard',
            'view_students',
            'create_students',
            'edit_students',
            'view_staff',
            'view_financials',
            'create_invoices',
            'edit_invoices',
            'manage_revenues',
            'manage_expenses',
            'view_leads',
            'create_leads',
            'edit_leads',
            'manage_lead_forms',
            'view_agenda',
            'create_agenda_items',
            'view_communications',
            'send_communications',
            'view_declarations',
            'generate_declarations',
            'view_gallery',
            'view_library',
            'view_reports',
        ]
    },
    {
        name: 'Coordenador(a)',
        permissions: [
            'view_dashboard',
            'view_students',
            'edit_students', // Can edit student academic data, but not create
            'view_staff',
            'view_agenda',
            'create_agenda_items',
            'view_communications',
            'view_gallery',
            'view_library',
            'view_reports',
        ]
    },
    {
        name: 'Pai/Responsável',
        permissions: [] // Parent portal access is determined by role, not specific permissions in this app version
    }
];