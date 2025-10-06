export type View = 'dashboard' | 'students' | 'staff' | 'financials' | 'leads' | 'agenda' | 'communications' | 'settings' | 'reports' | 'library' | 'gallery' | 'declarations' | 'users';

export type StudentDetailTab = 'details' | 'grades' | 'attendance' | 'occurrences' | 'individualAgenda' | 'documents' | 'contactHistory' | 'declarations';

export type DeclarationType = 'enrollment' | 'completion' | 'transfer' | 'tax' | 'clearance';

export enum StudentStatus {
    Active = 'Ativo',
    Inactive = 'Inativo',
    Graduated = 'Formado',
}

export enum PaymentStatus {
    Paid = 'Pago',
    Pending = 'Pendente',
    Overdue = 'Atrasado',
}

export enum LeadStatus {
    New = 'Novo',
    Contacted = 'Contactado',
    VisitScheduled = 'Visita Agendada',
    Enrolled = 'Matriculado',
    Lost = 'Perdido',
}

export enum StaffStatus {
    Active = 'Ativo',
    Inactive = 'Inativo',
}

export type StaffRole = 'Professor(a)' | 'Coordenador(a)' | 'Secretário(a)' | 'Diretor(a)' | string;

export enum AgendaItemType {
    Event = 'Evento',
    Homework = 'Lição de Casa',
    DailySummary = 'Resumo do Dia',
    Reminder = 'Lembrete',
}

export enum IndividualAgendaItemType {
    Alimentacao = 'Alimentação',
    Sono = 'Sono',
    Higiene = 'Higiene',
    Atividade = 'Atividade',
    Observacao = 'Observação',
}

export enum UserStatus {
    Active = 'Ativo',
    Inactive = 'Inativo',
}

export type UserRoleName = 'Admin' | 'Secretário(a)' | 'Coordenador(a)' | 'Pai/Responsável';

export enum ExpenseCategory {
    Salaries = 'Salários e Encargos',
    Rent = 'Aluguel e Contas',
    Supplies = 'Material de Escritório',
    Maintenance = 'Manutenção e Reparos',
    Marketing = 'Marketing e Publicidade',
    Other = 'Outros',
}

export enum RevenueCategory {
    Tuition = 'Mensalidades',
    Events = 'Eventos',
    Materials = 'Venda de Material',
    Donations = 'Doações',
    Other = 'Outros',
}

export interface Expense {
    id: number;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
}

export interface Revenue {
    id: number;
    description: string;
    category: RevenueCategory;
    amount: number;
    date: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRoleName;
    status: UserStatus;
    avatarUrl: string;
    studentId?: number;
}


export interface Grade {
    subject: string;
    score: number;
    term: string;
    type: string;
    weight: number;
}

export interface Attendance {
    date: string;
    status: 'Presente' | 'Ausente' | 'Justificado';
}

export interface Occurrence {
    id: number;
    date: string;
    type: 'Pedagógica' | 'Disciplinar' | 'Atendimento';
    description: string;
}

export interface IndividualAgendaItem {
    id: number;
    date: string;
    type: IndividualAgendaItemType;
    description: string;
    isSent: boolean;
}

export interface Document {
    id: number;
    title: string;
    uploadDate: string;
    url: string;
}

export interface CommunicationLog {
    id: number;
    date: string;
    type: 'Ligação' | 'Email' | 'Reunião' | 'Sistema';
    summary: string;
}

export interface Student {
    id: number;
    name: string;
    class: string;
    enrollmentDate: string;
    status: StudentStatus;
    parentName: string;
    parentContact: string;
    avatarUrl: string;
    cpf: string;
    address: string;
    email: string;
    phone: string;
    medicalNotes?: string;
    tuitionPlanId: number;
    grades: Grade[];
    attendance: Attendance[];
    occurrences: Occurrence[];
    documents: Document[];
    individualAgenda: IndividualAgendaItem[];
    communicationLog: CommunicationLog[];
}

export interface Payment {
    id: number;
    amount: number;
    date: string;
    method: 'Boleto' | 'PIX' | 'Cartão de Crédito';
}

export interface Invoice {
    id: string;
    studentName: string;
    studentId: number;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: PaymentStatus;
    payments: Payment[];
}

export interface Task {
    id: number;
    description: string;
    isCompleted: boolean;
}

export interface RequiredDocument {
    name: string;
    status: 'Pendente' | 'Recebido' | 'Inválido';
}

export interface Lead {
    id: number;
    name: string;
    parentName: string;
    contact: string;
    status: LeadStatus;
    interestDate: string;
    notes: string;
    tasks: Task[];
    isConverted: boolean;
    requiredDocuments: RequiredDocument[];
    communicationLog: CommunicationLog[];
}

export interface FinancialSummaryPoint {
    name: string;
    revenue: number;
    expenses: number;
}

export interface Staff {
    id: number;
    name: string;
    role: StaffRole;
    email: string;
    phone: string;
    hireDate: string;
    status: StaffStatus;
    avatarUrl: string;
    cpf: string;
    address: string;
}

export interface Communication {
    id: number;
    title: string;
    content: string;
    recipientGroup: string;
    sentDate: string;
}

export interface AgendaItem {
    id: number;
    date: string;
    title: string;
    description: string;
    type: AgendaItemType;
    classTarget: string;
    isSent: boolean;
}

export interface LibraryBook {
    id: number;
    title: string;
    author: string;
    isbn: string;
    status: 'Disponível' | 'Emprestado' | 'Em Manutenção';
    borrowedBy?: {
        studentId: number;
        studentName: string;
    };
    dueDate?: string;
}

export interface Photo {
    id: number;
    url: string;
    caption: string;
}

export interface PhotoAlbum {
    id: number;
    title: string;
    date: string;
    coverUrl: string;
    photos: Photo[];
}


export interface TuitionPlan {
    id: number;
    name: string;
    amount: number;
}

export interface LeadCaptureCampaign {
    id: string;
    name: string;
    publicUrl: string;
    createdAt: string;
    leadsCaptured: number;
}

export type Permission = 
  // Dashboard
  'view_dashboard' |
  // Students
  'view_students' |
  'create_students' |
  'edit_students' |
  // Staff
  'view_staff' |
  'create_staff' |
  'edit_staff' |
  // Financials
  'view_financials' |
  'create_invoices' |
  'edit_invoices' |
  'delete_invoices' |
  'manage_revenues' |
  'manage_expenses' |
  // Leads
  'view_leads' |
  'create_leads' |
  'edit_leads' |
  'manage_lead_forms' | // New permission
  // Agenda
  'view_agenda' |
  'create_agenda_items' |
  // Communications
  'view_communications' |
  'send_communications' |
  // Declarations
  'view_declarations' |
  'generate_declarations' |
  // Gallery
  'view_gallery' |
  'manage_gallery' |
  // Library
  'view_library' |
  'manage_library' |
  // Reports
  'view_reports' |
  // Admin
  'view_users' |
  'manage_users' |
  'view_settings' |
  'manage_settings' |
  'manage_permissions';

export interface Role {
    name: UserRoleName;
    permissions: Permission[];
}

export interface Settings {
    schoolInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        logoUrl: string;
        cnpj: string;
    };
    classes: string[];
    staffRoles: StaffRole[];
    tuitionPlans: TuitionPlan[];
    declarationTemplates: Record<DeclarationType, string>;
    roles: Role[];
}