import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';

// --- Helper para tratamento de query ---
const handleQuery = async <T>(query: Promise<{ data: T | null, error: any }>, operationName: string): Promise<T> => {
    const { data, error } = await query;
    if (error) {
        console.error(`Error in Supabase operation '${operationName}':`, error);
        throw new Error(error.message);
    }
    if (data === null) {
        // Captura falhas silenciosas da RLS em operações de insert/update/select.single
        throw new Error(`Operation '${operationName}' returned no data. This may be due to Row Level Security (RLS) policies or the requested item not being found.`);
    }
    return data;
};

// --- Helper para RPC (usado para leitura) ---
const handleRpc = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string) => {
    const { data, error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC ${rpcName}:`, error);
        throw new Error(error.message || `An error occurred in ${rpcName}.`);
    }
    return data;
};

// --- READ operations ---
// Mantendo RPCs para leitura, pois parecem estar funcionando e são mais seguros com RLS complexas.
export const getStudents = async (): Promise<Student[]> => handleRpc(supabase.rpc('get_students'), 'get_students');
export const getInvoices = async (): Promise<Invoice[]> => handleRpc(supabase.rpc('get_invoices'), 'get_invoices');
export const getLeads = async (): Promise<Lead[]> => handleRpc(supabase.rpc('get_leads'), 'get_leads');
export const getStaff = async (): Promise<Staff[]> => handleRpc(supabase.rpc('get_staff'), 'get_staff');
export const getUsers = async (): Promise<User[]> => handleRpc(supabase.rpc('get_users'), 'get_users');
export const getCommunications = async (): Promise<Communication[]> => handleRpc(supabase.rpc('get_communications'), 'get_communications');
export const getAgendaItems = async (): Promise<AgendaItem[]> => handleRpc(supabase.rpc('get_agenda_items'), 'get_agenda_items');
export const getLibraryBooks = async (): Promise<LibraryBook[]> => handleRpc(supabase.rpc('get_library_books'), 'get_library_books');
export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => handleRpc(supabase.rpc('get_photo_albums'), 'get_photo_albums');
export const getExpenses = async (): Promise<Expense[]> => handleRpc(supabase.rpc('get_expenses'), 'get_expenses');
export const getRevenues = async (): Promise<Revenue[]> => handleRpc(supabase.rpc('get_revenues'), 'get_revenues');
export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => handleRpc(supabase.rpc('get_lead_capture_campaigns'), 'get_lead_capture_campaigns');

export const getAuthenticatedUserProfile = async (): Promise<Staff | string | null> => {
    try {
        const data = await handleRpc(supabase.rpc('get_my_role'), 'get_my_role');
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


// --- WRITE operations (revertido para métodos padrão do Supabase com verificação estrita) ---

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => 
    handleQuery(supabase.from('students').insert(studentData).select().single(), 'addStudent');

export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => 
    handleQuery(supabase.from('students').update(studentData).eq('id', studentId).select().single(), 'updateStudent');

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> =>
    handleQuery(supabase.from('invoices').insert(invoiceData).select().single(), 'addInvoice');

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> =>
    handleQuery(supabase.from('invoices').update(invoiceData).eq('id', invoiceId).select().single(), 'updateInvoice');

export const deleteInvoice = async (invoiceId: string): Promise<void> =>
    handleQuery(supabase.from('invoices').delete().eq('id', invoiceId), 'deleteInvoice');

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> =>
    handleQuery(supabase.from('leads').insert(leadData).select().single(), 'addLead');

export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> =>
    handleQuery(supabase.from('leads').update(leadData).eq('id', leadId).select().single(), 'updateLead');

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> =>
    handleQuery(supabase.from('staff').insert(staffData).select().single(), 'addStaff');

export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> =>
    handleQuery(supabase.from('staff').update(staffData).eq('id', staffId).select().single(), 'updateStaff');

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> =>
    handleQuery(supabase.from('expenses').insert(expenseData).select().single(), 'addExpense');

export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> =>
    handleQuery(supabase.from('expenses').update(expenseData).eq('id', id).select().single(), 'updateExpense');

export const deleteExpense = async (id: number): Promise<void> =>
    handleQuery(supabase.from('expenses').delete().eq('id', id), 'deleteExpense');

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> =>
    handleQuery(supabase.from('revenues').insert(revenueData).select().single(), 'addRevenue');

export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> =>
    handleQuery(supabase.from('revenues').update(revenueData).eq('id', id).select().single(), 'updateRevenue');

export const deleteRevenue = async (id: number): Promise<void> =>
    handleQuery(supabase.from('revenues').delete().eq('id', id), 'deleteRevenue');

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> =>
    handleQuery(supabase.from('communications').insert(commData).select().single(), 'addCommunication');

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> =>
    handleQuery(supabase.from('agenda_items').insert(itemData).select().single(), 'addAgendaItem');

export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> =>
    handleQuery(supabase.from('agenda_items').update(itemData).eq('id', id).select().single(), 'updateAgendaItem');

// Users
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> =>
    handleQuery(supabase.from('users').insert(userData).select().single(), 'addUser');

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> =>
    handleQuery(supabase.from('users').update(userData).eq('id', id).select().single(), 'updateUser');

export const deleteUser = async (id: string): Promise<void> =>
    handleQuery(supabase.from('users').delete().eq('id', id), 'deleteUser');

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> =>
    handleQuery(supabase.from('lead_capture_campaigns').insert(campaignData).select().single(), 'addLeadCaptureCampaign');

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> =>
    handleQuery(supabase.from('photo_albums').insert(albumData).select().single(), 'addPhotoAlbum');

export const deletePhotoAlbum = async (id: number): Promise<void> =>
    handleQuery(supabase.from('photo_albums').delete().eq('id', id), 'deletePhotoAlbum');

export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> =>
    handleQuery(supabase.from('photo_albums').update({ photos: photos }).eq('id', albumId).select().single(), 'updateAlbumPhotos');

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> =>
    handleQuery(supabase.from('library_books').insert(bookData).select().single(), 'addLibraryBook');