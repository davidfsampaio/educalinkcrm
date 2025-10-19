import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';

// --- Helper para RPC (usado para leitura E escrita) ---
const handleRpc = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string) => {
    const { data, error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
    // For single-row write operations, Supabase RPC often returns an array with one item.
    // We'll extract it. If it's an array from a read operation, it's returned as is.
    return Array.isArray(data) && data.length === 1 ? data[0] : data;
};

// --- Helper for deletes which might not return data ---
const handleRpcEmpty = async (rpcCall: Promise<{ data: any, error: any }>, rpcName: string) => {
    const { error } = await rpcCall;
    if (error) {
        console.error(`Error in RPC '${rpcName}':`, error);
        throw new Error(error.message);
    }
};

// --- READ operations ---
// Mantendo RPCs para leitura.
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


// --- WRITE operations (migrated to RPC to bypass RLS recursion) ---

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => 
    handleRpc(supabase.rpc('add_student', { p_data: studentData }), 'add_student');

export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => 
    handleRpc(supabase.rpc('update_student', { p_id: studentId, p_data: studentData }), 'update_student');

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> =>
    handleRpc(supabase.rpc('add_invoice', { p_data: invoiceData }), 'add_invoice');

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> =>
    handleRpc(supabase.rpc('update_invoice', { p_id: invoiceId, p_data: invoiceData }), 'update_invoice');

export const deleteInvoice = async (invoiceId: string): Promise<void> =>
    handleRpcEmpty(supabase.rpc('delete_invoice', { p_id: invoiceId }), 'delete_invoice');

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> =>
    handleRpc(supabase.rpc('add_lead', { p_data: leadData }), 'add_lead');

export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> =>
    handleRpc(supabase.rpc('update_lead', { p_id: leadId, p_data: leadData }), 'update_lead');

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> =>
    handleRpc(supabase.rpc('add_staff', { p_data: staffData }), 'add_staff');

export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> =>
    handleRpc(supabase.rpc('update_staff', { p_id: staffId, p_data: staffData }), 'update_staff');

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> =>
    handleRpc(supabase.rpc('add_expense', { p_data: expenseData }), 'add_expense');

export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> =>
    handleRpc(supabase.rpc('update_expense', { p_id: id, p_data: expenseData }), 'update_expense');

export const deleteExpense = async (id: number): Promise<void> =>
    handleRpcEmpty(supabase.rpc('delete_expense', { p_id: id }), 'delete_expense');

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> =>
    handleRpc(supabase.rpc('add_revenue', { p_data: revenueData }), 'add_revenue');

export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> =>
    handleRpc(supabase.rpc('update_revenue', { p_id: id, p_data: revenueData }), 'update_revenue');

export const deleteRevenue = async (id: number): Promise<void> =>
    handleRpcEmpty(supabase.rpc('delete_revenue', { p_id: id }), 'delete_revenue');

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> =>
    handleRpc(supabase.rpc('add_communication', { p_data: commData }), 'add_communication');

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> =>
    handleRpc(supabase.rpc('add_agenda_item', { p_data: itemData }), 'add_agenda_item');

export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> =>
    handleRpc(supabase.rpc('update_agenda_item', { p_id: id, p_data: itemData }), 'update_agenda_item');

// Users
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> =>
    handleRpc(supabase.rpc('add_user', { p_data: userData }), 'add_user');

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> =>
    handleRpc(supabase.rpc('update_user', { p_id: id, p_data: userData }), 'update_user');

export const deleteUser = async (id: string): Promise<void> =>
    handleRpcEmpty(supabase.rpc('delete_user', { p_id: id }), 'delete_user');

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> =>
    handleRpc(supabase.rpc('add_lead_capture_campaign', { p_data: campaignData }), 'add_lead_capture_campaign');

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> =>
    handleRpc(supabase.rpc('add_photo_album', { p_data: albumData }), 'add_photo_album');

export const deletePhotoAlbum = async (id: number): Promise<void> =>
    handleRpcEmpty(supabase.rpc('delete_photo_album', { p_id: id }), 'delete_photo_album');

export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> =>
    handleRpc(supabase.rpc('update_album_photos', { p_id: albumId, p_photos: photos }), 'update_album_photos');

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> =>
    handleRpc(supabase.rpc('add_library_book', { p_data: bookData }), 'add_library_book');