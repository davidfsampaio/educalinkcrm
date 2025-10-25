import { ReactNode } from 'react';

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
    Medicacao = 'Medicação',
    Disposicao = 'Disposição',
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

export interface School {
    id: string; // uuid
    name: string;
    // Potentially add subscription info, etc.
}

export interface Expense {
    id: number;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    school_id: string;
}

export interface Revenue {
    id: number;
    description: string;
    category: RevenueCategory;
    amount: number;
    date: string;
    school_id: string;
}

export interface User {
    id: string; // Changed from number to string to match Supabase auth UUIDs
    name: string;
    email: string;
    role: UserRoleName;
    status: UserStatus;
    avatar_url: string;
    student_id?: number;
    school_id: string;
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
    created_at: string;
    type: IndividualAgendaItemType;
    selections?: string[];
    description: string;
    is_sent: boolean;
}

export interface Document {
    id: number;
    title: string;
    upload_date: string;
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
    enrollment_date: string;
    status: StudentStatus;
    parent_name: string;
    parent_contact: string;
    avatar_url: string;
    cpf: string;
    address: string;
    email: string;
    phone: string;
    medical_notes?: string;
    tuition_plan_id: number;
    grades: Grade[];
    attendance: Attendance[];
    occurrences: Occurrence[];
    documents: Document[];
    individual_agenda: IndividualAgendaItem[];
    communication_log: CommunicationLog[];
    school_id: string;
}

// Represents the columns in the 'students' table for inserts/updates
export type StudentColumns = Omit<Student, 'id' | 'grades' | 'attendance' | 'occurrences' | 'documents' | 'individual_agenda' | 'communication_log'>;
export type StudentUpdate = Partial<Omit<Student, 'id' | 'school_id'>>;


export interface Payment {
    id: number;
    amount: number;
    date: string;
    method: 'Boleto' | 'PIX' | 'Cartão de Crédito';
}

export interface Invoice {
    id: string;
    student_name: string;
    student_id: number;
    amount: number;
    due_date: string;
    paid_date?: string;
    status: PaymentStatus;
    payments: Payment[];
    school_id: string;
}

export type InvoiceColumns = Omit<Invoice, 'payments'>;
export type InvoiceUpdate = Partial<Omit<Invoice, 'id' | 'student_id' | 'student_name' | 'school_id'>>;


export interface Task {
    id: number;
    description: string;
    is_completed: boolean;
}

export interface RequiredDocument {
    name: string;
    status: 'Pendente' | 'Recebido' | 'Inválido';
}

export interface Lead {
    id: number;
    name: string;
    parent_name: string;
    contact: string;
    status: LeadStatus;
    interest_date: string;
    notes: string;
    tasks: Task[];
    is_converted: boolean;
    required_documents: RequiredDocument[];
    communication_log: CommunicationLog[];
    school_id: string;
}

export type LeadColumns = Omit<Lead, 'id' | 'tasks' | 'required_documents' | 'communication_log'>;
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'school_id'>>;


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
    hire_date: string;
    status: StaffStatus;
    avatar_url: string;
    cpf: string;
    address: string;
    school_id: string;
}

export interface Communication {
    id: number;
    title: string;
    content: string;
    recipient_group: string;
    sent_date: string;
    school_id: string;
}

export interface AgendaItem {
    id: number;
    date: string;
    title: string;
    description: string;
    type: AgendaItemType;
    class_target: string;
    is_sent: boolean;
    school_id: string;
}

export interface LibraryBook {
    id: number;
    title: string;
    author: string;
    isbn: string;
    status: 'Disponível' | 'Emprestado' | 'Em Manutenção';
    borrowed_by?: {
        student_id: number;
        student_name: string;
    };
    due_date?: string;
    school_id: string;
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
    cover_url: string;
    photos: Photo[];
    school_id: string;
}

export type PhotoAlbumColumns = Omit<PhotoAlbum, 'id' | 'photos'>;


export interface TuitionPlan {
    id: number;
    name: string;
    amount: number;
    school_id: string;
}

export interface LeadCaptureCampaign {
    id: string;
    name: string;
    public_url: string;
    created_at: string;
    leads_captured: number;
    school_id: string;
}

export interface DataContextType {
    students: Student[];
    invoices: Invoice[];
    leads: Lead[];
    staff: Staff[];
    users: User[];
    communications: Communication[];
    agendaItems: AgendaItem[];
    libraryBooks: LibraryBook[];
    photoAlbums: PhotoAlbum[];
    financialSummary: FinancialSummaryPoint[];
    expenses: Expense[];
    revenues: Revenue[];
    leadCaptureCampaigns: LeadCaptureCampaign[];
    tuitionPlans: TuitionPlan[];
    loading: boolean;
    addStudent: (studentData: Pick<Student, 'name' | 'class' | 'parent_name' | 'parent_contact' | 'cpf' | 'address' | 'email' | 'phone' | 'tuition_plan_id'>) => void;
    updateStudent: (updatedStudent: Student) => void;
    deleteStudent: (studentId: number) => void;
    addLead: (leadData: Omit<Lead, 'id' | 'school_id'>, campaignId?: string) => void;
    updateLead: (updatedLead: Lead) => void;
    deleteLead: (leadId: number) => void;
    addInvoice: (invoiceData: Omit<Invoice, 'id' | 'school_id' | 'status' | 'payments' | 'student_name'> & { student_id: number }) => void;
    updateInvoice: (updatedInvoice: Invoice) => void;
    deleteInvoice: (invoiceId: string) => void;
    addExpense: (expenseData: Omit<Expense, 'id' | 'school_id'>) => void;
    updateExpense: (updatedExpense: Expense) => void;
    deleteExpense: (expenseId: number) => void;
    addRevenue: (revenueData: Omit<Revenue, 'id' | 'school_id'>) => void;
    updateRevenue: (updatedRevenue: Revenue) => void;
    deleteRevenue: (revenueId: number) => void;
    addStaff: (staffData: Pick<Staff, 'name' | 'role' | 'email' | 'phone' | 'cpf' | 'address'>) => void;
    updateStaff: (updatedStaff: Staff) => void;
    deleteStaff: (staffId: number) => void;
    addCommunication: (commData: Omit<Communication, 'id' | 'school_id' | 'sent_date'>) => void;
    updateCommunication: (updatedComm: Communication) => void;
    deleteCommunication: (commId: number) => void;
    addAgendaItem: (itemData: Omit<AgendaItem, 'id' | 'school_id' | 'is_sent'>) => void;
    updateAgendaItem: (updatedItem: AgendaItem) => void;
    deleteAgendaItem: (itemId: number) => void;
    addUser: (userData: Omit<User, 'id' | 'school_id' | 'avatar_url' | 'status'> & { password?: string }) => void;
    updateUser: (updatedUser: User) => void;
    deleteUser: (userId: string) => void;
    addLeadCaptureCampaign: (campaign: Omit<LeadCaptureCampaign, 'id' | 'school_id' | 'public_url' | 'created_at' | 'leads_captured'>) => void;
    addPhotoAlbum: (albumData: Omit<PhotoAlbum, 'id' | 'school_id' | 'photos'>) => void;
    updatePhotoAlbum: (updatedAlbum: Omit<PhotoAlbum, 'school_id' | 'photos'>) => void;
    deletePhotoAlbum: (albumId: number) => void;
    addPhotoToAlbum: (albumId: number, photoData: { url: string; caption: string }) => void;
    deletePhotoFromAlbum: (albumId: number, photoId: number) => void;
    addLibraryBook: (bookData: Omit<LibraryBook, 'id' | 'school_id'>) => void;
    updateLibraryBook: (updatedBook: LibraryBook) => void;
    deleteLibraryBook: (bookId: number) => void;
    addTuitionPlan: (planData: Omit<TuitionPlan, 'id' | 'school_id'>) => void;
    updateTuitionPlan: (updatedPlan: Omit<TuitionPlan, 'school_id'>) => void;
    deleteTuitionPlan: (planId: number) => void;
}

export type Permission = 
  // Dashboard
  'view_dashboard' |
  // Students
  'view_students' |
  'create_students' |
  'edit_students' |
  'delete_students' |
  // Staff
  'view_staff' |
  'create_staff' |
  'edit_staff' |
  'delete_staff' |
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
  'delete_leads' |
  'manage_lead_forms' |
  // Agenda
  'view_agenda' |
  'create_agenda_items' |
  'edit_agenda_items' |
  'delete_agenda_items' |
  // Communications
  'view_communications' |
  'send_communications' |
  'edit_communications' |
  'delete_communications' |
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
    tuitionPlans: Omit<TuitionPlan, 'school_id'>[];
    declarationTemplates: Record<DeclarationType, string>;
    roles: Role[];
}