import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';

// --- Helper para RPC ---
// Este helper padroniza o tratamento de erros e a verificação de dados para chamadas RPC.
const handleRpcResponse = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string, returnsData: boolean = true) => {
    const { data, error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC ${rpcName}:`, error);
        throw new Error(error.message || `An error occurred in ${rpcName}.`);
    }
    if (returnsData && !data) {
        // Se a RLS bloquear silenciosamente ou a função não retornar nada quando deveria, isso gera um erro claro.
        throw new Error(`RPC ${rpcName} did not return the expected data. The operation may have been blocked silently by database policies.`);
    }
    return data;
};


// --- READ operations ---
// As operações de leitura já usam RPCs e estão funcionando.
export const getStudents = async (): Promise<Student[]> => handleRpcResponse(supabase.rpc('get_students'), 'get_students');
export const getInvoices = async (): Promise<Invoice[]> => handleRpcResponse(supabase.rpc('get_invoices'), 'get_invoices');
export const getLeads = async (): Promise<Lead[]> => handleRpcResponse(supabase.rpc('get_leads'), 'get_leads');
export const getStaff = async (): Promise<Staff[]> => handleRpcResponse(supabase.rpc('get_staff'), 'get_staff');
export const getUsers = async (): Promise<User[]> => handleRpcResponse(supabase.rpc('get_users'), 'get_users');
export const getCommunications = async (): Promise<Communication[]> => handleRpcResponse(supabase.rpc('get_communications'), 'get_communications');
export const getAgendaItems = async (): Promise<AgendaItem[]> => handleRpcResponse(supabase.rpc('get_agenda_items'), 'get_agenda_items');
export const getLibraryBooks = async (): Promise<LibraryBook[]> => handleRpcResponse(supabase.rpc('get_library_books'), 'get_library_books');
export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => handleRpcResponse(supabase.rpc('get_photo_albums'), 'get_photo_albums');
export const getExpenses = async (): Promise<Expense[]> => handleRpcResponse(supabase.rpc('get_expenses'), 'get_expenses');
export const getRevenues = async (): Promise<Revenue[]> => handleRpcResponse(supabase.rpc('get_revenues'), 'get_revenues');
export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => handleRpcResponse(supabase.rpc('get_lead_capture_campaigns'), 'get_lead_capture_campaigns');

export const getAuthenticatedUserProfile = async (): Promise<Staff | string | null> => {
    try {
        const data = await handleRpcResponse(supabase.rpc('get_my_role'), 'get_my_role');
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


// --- WRITE operations (MIGRATED TO RPC) ---

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => 
    handleRpcResponse(supabase.rpc('add_student', { p_data: studentData }), 'add_student');

export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => 
    handleRpcResponse(supabase.rpc('update_student', { p_id: studentId, p_data: studentData }), 'update_student');

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> =>
    handleRpcResponse(supabase.rpc('add_invoice', { p_data: invoiceData }), 'add_invoice');

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> =>
    handleRpcResponse(supabase.rpc('update_invoice', { p_id: invoiceId, p_data: invoiceData }), 'update_invoice');

export const deleteInvoice = async (invoiceId: string): Promise<void> =>
    handleRpcResponse(supabase.rpc('delete_invoice', { p_id: invoiceId }), 'delete_invoice', false);

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> =>
    handleRpcResponse(supabase.rpc('add_lead', { p_data: leadData }), 'add_lead');

export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> =>
    handleRpcResponse(supabase.rpc('update_lead', { p_id: leadId, p_data: leadData }), 'update_lead');

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> =>
    handleRpcResponse(supabase.rpc('add_staff', { p_data: staffData }), 'add_staff');

export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> =>
    handleRpcResponse(supabase.rpc('update_staff', { p_id: staffId, p_data: staffData }), 'update_staff');

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> =>
    handleRpcResponse(supabase.rpc('add_expense', { p_data: expenseData }), 'add_expense');

export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> =>
    handleRpcResponse(supabase.rpc('update_expense', { p_id: id, p_data: expenseData }), 'update_expense');

export const deleteExpense = async (id: number): Promise<void> =>
    handleRpcResponse(supabase.rpc('delete_expense', { p_id: id }), 'delete_expense', false);

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> =>
    handleRpcResponse(supabase.rpc('add_revenue', { p_data: revenueData }), 'add_revenue');

export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> =>
    handleRpcResponse(supabase.rpc('update_revenue', { p_id: id, p_data: revenueData }), 'update_revenue');

export const deleteRevenue = async (id: number): Promise<void> =>
    handleRpcResponse(supabase.rpc('delete_revenue', { p_id: id }), 'delete_revenue', false);

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> =>
    handleRpcResponse(supabase.rpc('add_communication', { p_data: commData }), 'add_communication');

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> =>
    handleRpcResponse(supabase.rpc('add_agenda_item', { p_data: itemData }), 'add_agenda_item');

export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> =>
    handleRpcResponse(supabase.rpc('update_agenda_item', { p_id: id, p_data: itemData }), 'update_agenda_item');

// Users
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> =>
    handleRpcResponse(supabase.rpc('add_user', { p_data: userData }), 'add_user');

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> =>
    handleRpcResponse(supabase.rpc('update_user', { p_id: id, p_data: userData }), 'update_user');

export const deleteUser = async (id: string): Promise<void> =>
    handleRpcResponse(supabase.rpc('delete_user', { p_id: id }), 'delete_user', false);

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> =>
    handleRpcResponse(supabase.rpc('add_lead_capture_campaign', { p_data: campaignData }), 'add_lead_capture_campaign');

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> =>
    handleRpcResponse(supabase.rpc('add_photo_album', { p_data: albumData }), 'add_photo_album');

export const deletePhotoAlbum = async (id: number): Promise<void> =>
    handleRpcResponse(supabase.rpc('delete_photo_album', { p_id: id }), 'delete_photo_album', false);

export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> =>
    handleRpcResponse(supabase.rpc('update_album_photos', { p_id: albumId, p_photos: photos }), 'update_album_photos');

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> =>
    handleRpcResponse(supabase.rpc('add_library_book', { p_data: bookData }), 'add_library_book');