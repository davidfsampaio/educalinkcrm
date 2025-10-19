import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';

// --- Helper para chamadas diretas ao Supabase (INSERT, UPDATE) ---
const handleSupabaseWrite = async (queryPromise: Promise<{ data: any, error: any }>) => {
    const { data, error } = await queryPromise;
    if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
    }
    // .select().single() deve retornar um objeto. Se for nulo, a operação falhou (por exemplo, bloqueada pela RLS).
    // Isso transforma falhas silenciosas em erros explícitos.
    if (data === null) {
        throw new Error("A operação falhou. A política de segurança (RLS) pode ter impedido a escrita dos dados.");
    }
    return data;
};

// --- Helper para chamadas DELETE ---
const handleSupabaseDelete = async (queryPromise: Promise<{ error: any }>) => {
    const { error } = await queryPromise;
    if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(error.message);
    }
};


// --- READ operations (mantendo RPCs para leitura, pois parecem funcionar) ---
const handleRpcRead = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string) => {
    const { data, error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
    return data || []; // Garante que sempre retorne um array
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

// --- WRITE operations (usando métodos padrão com verificação de retorno) ---

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => 
    handleSupabaseWrite(supabase.from('students').insert(studentData).select().single());

export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => 
    handleSupabaseWrite(supabase.from('students').update(studentData).eq('id', studentId).select().single());

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> =>
    handleSupabaseWrite(supabase.from('invoices').insert(invoiceData).select().single());

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> =>
    handleSupabaseWrite(supabase.from('invoices').update(invoiceData).eq('id', invoiceId).select().single());

export const deleteInvoice = async (invoiceId: string): Promise<void> =>
    handleSupabaseDelete(supabase.from('invoices').delete().eq('id', invoiceId));

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> =>
    handleSupabaseWrite(supabase.from('leads').insert(leadData).select().single());

export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> =>
    handleSupabaseWrite(supabase.from('leads').update(leadData).eq('id', leadId).select().single());

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> =>
    handleSupabaseWrite(supabase.from('staff').insert(staffData).select().single());

export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> =>
    handleSupabaseWrite(supabase.from('staff').update(staffData).eq('id', staffId).select().single());

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> =>
    handleSupabaseWrite(supabase.from('expenses').insert(expenseData).select().single());

export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> =>
    handleSupabaseWrite(supabase.from('expenses').update(expenseData).eq('id', id).select().single());

export const deleteExpense = async (id: number): Promise<void> =>
    handleSupabaseDelete(supabase.from('expenses').delete().eq('id', id));

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> =>
    handleSupabaseWrite(supabase.from('revenues').insert(revenueData).select().single());

export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> =>
    handleSupabaseWrite(supabase.from('revenues').update(revenueData).eq('id', id).select().single());

export const deleteRevenue = async (id: number): Promise<void> =>
    handleSupabaseDelete(supabase.from('revenues').delete().eq('id', id));

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> =>
    handleSupabaseWrite(supabase.from('communications').insert(commData).select().single());

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> =>
    handleSupabaseWrite(supabase.from('agenda').insert(itemData).select().single());

export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> =>
    handleSupabaseWrite(supabase.from('agenda').update(itemData).eq('id', id).select().single());

// Users
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> =>
     handleSupabaseWrite(supabase.from('users').insert(userData).select().single());

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> =>
    handleSupabaseWrite(supabase.from('users').update(userData).eq('id', id).select().single());

export const deleteUser = async (id: string): Promise<void> =>
    handleSupabaseDelete(supabase.from('users').delete().eq('id', id));

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> =>
    handleSupabaseWrite(supabase.from('lead_capture_campaigns').insert(campaignData).select().single());

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> =>
    handleSupabaseWrite(supabase.from('photo_albums').insert(albumData).select().single());

export const deletePhotoAlbum = async (id: number): Promise<void> =>
    handleSupabaseDelete(supabase.from('photo_albums').delete().eq('id', id));

// Esta função atualiza o campo de fotos, que é um JSON. É um caso especial.
export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> =>
    handleSupabaseWrite(supabase.from('photo_albums').update({ photos }).eq('id', albumId).select().single());

// Library (Exemplo, se necessário)
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> =>
    handleSupabaseWrite(supabase.from('library_books').insert(bookData).select().single());
