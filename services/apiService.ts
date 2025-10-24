import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns, TuitionPlan
} from '../types';
import { supabase } from './supabaseClient';

// --- Helper para chamadas RPC de escrita (INSERT, UPDATE, DELETE) ---
// Esta é a abordagem recomendada para contornar problemas de RLS recursiva.
const handleRpcWrite = async (rpcName: string, params: object) => {
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
    // As RPCs devem retornar os dados inseridos/atualizados. Se for nulo, algo deu errado.
    if (data === null || (Array.isArray(data) && data.length === 0)) {
         throw new Error(`A operação '${rpcName}' falhou no servidor e não retornou dados. Verifique a função no backend.`);
    }
    // RPCs que retornam um único item geralmente o retornam dentro de um array.
    return Array.isArray(data) ? data[0] : data;
};

// --- Helper para chamadas DELETE RPC (que podem não retornar dados) ---
const handleRpcDelete = async (rpcName: string, params: object) => {
    const { error } = await supabase.rpc(rpcName, params);
     if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
};

// --- READ operations (mantendo RPCs para leitura) ---
const handleRpcRead = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string) => {
    const { data, error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
    return data || [];
};

export const getStudents = async (): Promise<Student[]> => handleRpcRead(supabase.rpc('get_students'), 'get_students');
export const getInvoices = async (): Promise<Invoice[]> => handleRpcRead(supabase.rpc('get_invoices'), 'get_invoices');
export const getLeads = async (): Promise<Lead[]> => handleRpcRead(supabase.rpc('get_leads'), 'get_leads');
export const getStaff = async (): Promise<Staff[]> => handleRpcRead(supabase.rpc('get_staff'), 'get_staff');
export const getUsers = async (): Promise<User[]> => handleRpcRead(supabase.rpc('get_users'), 'get_users');
export const getCommunications = async (): Promise<Communication[]> => handleRpcRead(supabase.rpc('get_communications'), 'get_communications');
export const getAgendaItems = async (): Promise<AgendaItem[]> => handleRpcRead(supabase.rpc('get_agenda_items'), 'get_agenda_items');
export const getLibraryBooks = async (): Promise<LibraryBook[]> => handleRpcRead(supabase.rpc('get_library_books'), 'get_library_books');
export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => handleRpcRead(supabase.rpc('get_photo_albums'), 'get_photo_albums');
export const getExpenses = async (): Promise<Expense[]> => handleRpcRead(supabase.rpc('get_expenses'), 'get_expenses');
export const getRevenues = async (): Promise<Revenue[]> => handleRpcRead(supabase.rpc('get_revenues'), 'get_revenues');
export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => handleRpcRead(supabase.rpc('get_lead_capture_campaigns'), 'get_lead_capture_campaigns');
export const getTuitionPlans = async (): Promise<TuitionPlan[]> => handleRpcRead(supabase.rpc('get_tuition_plans'), 'get_tuition_plans');


export const getAuthenticatedUserProfile = async (): Promise<Staff | string | null> => {
    try {
        const { data, error } = await supabase.rpc('get_my_role');
        if (error) throw error;
        const result = Array.isArray(data) ? data[0] : data;
        if (typeof result === 'object' && result !== null) return result as Staff;
        if (typeof result === 'string' && result.length > 0) return result;
        console.warn("RPC 'get_my_role' returned an unexpected value.", result);
        return null;
    } catch (error) {
        console.error("Failed to get authenticated user profile:", error);
        return null;
    }
};

// --- WRITE operations (usando RPCs) ---
// NOTA: Você precisará criar essas funções no seu backend Supabase!

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => 
    handleRpcWrite('insert_student', { p_data: studentData });

export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => 
    handleRpcWrite('update_student', { p_id: studentId, p_data: studentData });

export const deleteStudent = async (studentId: number): Promise<void> =>
    handleRpcDelete('delete_student', { p_id: studentId });

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> =>
    handleRpcWrite('insert_invoice', { p_data: invoiceData });

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> =>
    handleRpcWrite('update_invoice', { p_id: invoiceId, p_data: invoiceData });

export const deleteInvoice = async (invoiceId: string): Promise<void> =>
    handleRpcDelete('delete_invoice', { p_id: invoiceId });

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> =>
    handleRpcWrite('insert_lead', { p_data: leadData });

export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> =>
    handleRpcWrite('update_lead', { p_id: leadId, p_data: leadData });

export const deleteLead = async (leadId: number): Promise<void> =>
    handleRpcDelete('delete_lead', { p_id: leadId });

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> =>
    handleRpcWrite('insert_staff', { p_data: staffData });

export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> =>
    handleRpcWrite('update_staff', { p_id: staffId, p_data: staffData });

export const deleteStaff = async (staffId: number): Promise<void> =>
    handleRpcDelete('delete_staff', { p_id: staffId });

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> =>
    handleRpcWrite('insert_expense', { p_data: expenseData });

export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> =>
    handleRpcWrite('update_expense', { p_id: id, p_data: expenseData });

export const deleteExpense = async (id: number): Promise<void> =>
    handleRpcDelete('delete_expense', { p_id: id });

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> =>
    handleRpcWrite('insert_revenue', { p_data: revenueData });

export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> =>
    handleRpcWrite('update_revenue', { p_id: id, p_data: revenueData });

export const deleteRevenue = async (id: number): Promise<void> =>
    handleRpcDelete('delete_revenue', { p_id: id });

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> =>
    handleRpcWrite('insert_communication', { p_data: commData });

export const updateCommunication = async (id: number, commData: Partial<Omit<Communication, 'id' | 'school_id'>>): Promise<Communication> =>
    handleRpcWrite('update_communication', { p_id: id, p_data: commData });

export const deleteCommunication = async (id: number): Promise<void> =>
    handleRpcDelete('delete_communication', { p_id: id });

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> =>
    handleRpcWrite('insert_agenda_item', { p_data: itemData });

export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> =>
    handleRpcWrite('update_agenda_item', { p_id: id, p_data: itemData });

export const deleteAgendaItem = async (id: number): Promise<void> =>
    handleRpcDelete('delete_agenda_item', { p_id: id });

// Users
export const addUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<User> =>
     handleRpcWrite('insert_user', { p_data: userData });

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> =>
    handleRpcWrite('update_user', { p_id: id, p_data: userData });

export const deleteUser = async (id: string): Promise<void> =>
    handleRpcDelete('delete_user', { p_id: id });

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> =>
    handleRpcWrite('insert_lead_capture_campaign', { p_data: campaignData });

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> =>
    handleRpcWrite('insert_photo_album', { p_data: albumData });

export const updatePhotoAlbum = async (id: number, albumData: Partial<Omit<PhotoAlbum, 'id' | 'school_id' | 'photos'>>): Promise<PhotoAlbum> =>
    handleRpcWrite('update_photo_album', { p_id: id, p_data: albumData });

export const deletePhotoAlbum = async (id: number): Promise<void> =>
    handleRpcDelete('delete_photo_album', { p_id: id });

export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> =>
    handleRpcWrite('update_album_photos', { p_id: albumId, p_photos: photos });

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> =>
    handleRpcWrite('insert_library_book', { p_data: bookData });

export const updateLibraryBook = async (id: number, bookData: Partial<Omit<LibraryBook, 'id' | 'school_id'>>): Promise<LibraryBook> =>
    handleRpcWrite('update_library_book', { p_id: id, p_data: bookData });

export const deleteLibraryBook = async (id: number): Promise<void> =>
    handleRpcDelete('delete_library_book', { p_id: id });

// Tuition Plans
export const addTuitionPlan = async (planData: Omit<TuitionPlan, 'id'>): Promise<TuitionPlan> =>
    handleRpcWrite('insert_tuition_plan', { p_data: planData });

export const updateTuitionPlan = async (id: number, planData: Partial<Omit<TuitionPlan, 'id' | 'school_id'>>): Promise<TuitionPlan> =>
    handleRpcWrite('update_tuition_plan', { p_id: id, p_data: planData });

export const deleteTuitionPlan = async (id: number): Promise<void> =>
    handleRpcDelete('delete_tuition_plan', { p_id: id });