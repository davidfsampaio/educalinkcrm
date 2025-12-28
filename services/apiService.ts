
import { supabase } from './supabaseClient';
import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, TuitionPlan, StudentColumns, LeadColumns, InvoiceColumns, PhotoAlbumColumns
} from '../types';

// Helper centralizado para tratar respostas e evitar erros de sintaxe SQL
const handleResponse = <T>(response: { data: T | null; error: any }) => {
    if (response.error) {
        // Se for erro de "não encontrado" (PGRST116), retornamos null em vez de travar
        if (response.error.code === 'PGRST116') return null;
        
        console.error("Supabase API Error:", response.error);
        throw new Error(response.error.message || "Erro na base de dados.");
    }
    return response.data as T;
};

// --- Users ---
export const getUsers = async () => 
    handleResponse<User[]>(await supabase.from('users').select('*'));

export const getUserById = async (userId: string) => {
    if (!userId) return null;
    try {
        const response = await supabase.from('users').select('*').eq('id', userId).single();
        return handleResponse<User>(response);
    } catch (e) {
        console.error("Erro ao buscar usuário por ID:", e);
        return null;
    }
};

export const addUser = async (data: any) => 
    handleResponse<User>(await supabase.from('users').insert(data).select().single());

export const updateUser = async (id: string, data: any) => 
    handleResponse<User>(await supabase.from('users').update(data).eq('id', id).select().single());

export const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Students ---
export const getStudents = async () => 
    handleResponse<Student[]>(await supabase.from('students').select('*').order('name'));

export const addStudent = async (data: StudentColumns) => 
    handleResponse<Student>(await supabase.from('students').insert(data).select().single());

export const updateStudent = async (id: number, data: any) => 
    handleResponse<Student>(await supabase.from('students').update(data).eq('id', id).select().single());

export const deleteStudent = async (id: number) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Invoices ---
export const getInvoices = async () => 
    handleResponse<Invoice[]>(await supabase.from('invoices').select('*').order('due_date', { ascending: false }));

export const addInvoice = async (data: InvoiceColumns) => 
    handleResponse<Invoice>(await supabase.from('invoices').insert(data).select().single());

export const updateInvoice = async (id: string, data: any) => 
    handleResponse<Invoice>(await supabase.from('invoices').update(data).eq('id', id).select().single());

export const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Leads ---
export const getLeads = async () => 
    handleResponse<Lead[]>(await supabase.from('leads').select('*').order('interest_date', { ascending: false }));

export const addLead = async (data: LeadColumns) => 
    handleResponse<Lead>(await supabase.from('leads').insert(data).select().single());

export const updateLead = async (id: number, data: any) => 
    handleResponse<Lead>(await supabase.from('leads').update(data).eq('id', id).select().single());

export const deleteLead = async (id: number) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Staff ---
export const getStaff = async () => 
    handleResponse<Staff[]>(await supabase.from('staff').select('*').order('name'));

export const addStaff = async (data: Omit<Staff, 'id'>) => 
    handleResponse<Staff>(await supabase.from('staff').insert(data).select().single());

export const updateStaff = async (id: number, data: any) => 
    handleResponse<Staff>(await supabase.from('staff').update(data).eq('id', id).select().single());

export const deleteStaff = async (id: number) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Communications ---
export const getCommunications = async () => 
    handleResponse<Communication[]>(await supabase.from('communications').select('*').order('sent_date', { ascending: false }));

export const addCommunication = async (data: Omit<Communication, 'id'>) => 
    handleResponse<Communication>(await supabase.from('communications').insert(data).select().single());

export const updateCommunication = async (id: number, data: any) => 
    handleResponse<Communication>(await supabase.from('communications').update(data).eq('id', id).select().single());

export const deleteCommunication = async (id: number) => {
    const { error } = await supabase.from('communications').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Agenda ---
export const getAgendaItems = async () => 
    handleResponse<AgendaItem[]>(await supabase.from('agenda_items').select('*').order('date', { ascending: false }));

export const addAgendaItem = async (data: Omit<AgendaItem, 'id'>) => 
    handleResponse<AgendaItem>(await supabase.from('agenda_items').insert(data).select().single());

export const updateAgendaItem = async (id: number, data: any) => 
    handleResponse<AgendaItem>(await supabase.from('agenda_items').update(data).eq('id', id).select().single());

export const deleteAgendaItem = async (id: number) => {
    const { error } = await supabase.from('agenda_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Library ---
export const getLibraryBooks = async () => 
    handleResponse<LibraryBook[]>(await supabase.from('library_books').select('*').order('title'));

export const addLibraryBook = async (data: Omit<LibraryBook, 'id'>) => 
    handleResponse<LibraryBook>(await supabase.from('library_books').insert(data).select().single());

export const updateLibraryBook = async (id: number, data: any) => 
    handleResponse<LibraryBook>(await supabase.from('library_books').update(data).eq('id', id).select().single());

export const deleteLibraryBook = async (id: number) => {
    const { error } = await supabase.from('library_books').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Gallery ---
export const getPhotoAlbums = async () => 
    handleResponse<PhotoAlbum[]>(await supabase.from('photo_albums').select('*').order('date', { ascending: false }));

export const addPhotoAlbum = async (data: PhotoAlbumColumns) => 
    handleResponse<PhotoAlbum>(await supabase.from('photo_albums').insert(data).select().single());

export const updatePhotoAlbum = async (id: number, data: any) => 
    handleResponse<PhotoAlbum>(await supabase.from('photo_albums').update(data).eq('id', id).select().single());

export const deletePhotoAlbum = async (id: number) => {
    const { error } = await supabase.from('photo_albums').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const updateAlbumPhotos = async (albumId: number, photos: Photo[]) => 
    handleResponse<PhotoAlbum>(await supabase.from('photo_albums').update({ photos }).eq('id', albumId).select().single());

// --- Financial Management ---
export const getExpenses = async () => 
    handleResponse<Expense[]>(await supabase.from('expenses').select('*').order('date', { ascending: false }));

export const addExpense = async (data: Omit<Expense, 'id'>) => 
    handleResponse<Expense>(await supabase.from('expenses').insert(data).select().single());

export const updateExpense = async (id: number, data: any) => 
    handleResponse<Expense>(await supabase.from('expenses').update(data).eq('id', id).select().single());

export const deleteExpense = async (id: number) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const getRevenues = async () => 
    handleResponse<Revenue[]>(await supabase.from('revenues').select('*').order('date', { ascending: false }));

export const addRevenue = async (data: Omit<Revenue, 'id'>) => 
    handleResponse<Revenue>(await supabase.from('revenues').insert(data).select().single());

export const updateRevenue = async (id: number, data: any) => 
    handleResponse<Revenue>(await supabase.from('revenues').update(data).eq('id', id).select().single());

export const deleteRevenue = async (id: number) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Tuition Plans ---
export const getTuitionPlans = async () => 
    handleResponse<TuitionPlan[]>(await supabase.from('tuition_plans').select('*').order('name'));

export const addTuitionPlan = async (data: Omit<TuitionPlan, 'id'>) => 
    handleResponse<TuitionPlan>(await supabase.from('tuition_plans').insert(data).select().single());

export const updateTuitionPlan = async (id: number, data: any) => 
    handleResponse<TuitionPlan>(await supabase.from('tuition_plans').update(data).eq('id', id).select().single());

export const deleteTuitionPlan = async (id: number) => {
    const { error } = await supabase.from('tuition_plans').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Settings & Marketing ---
export const getSchoolSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const schoolId = user.user_metadata?.school_id;
    if (!schoolId) return null;
    return handleResponse<any>(await supabase.from('schools').select('*').eq('id', schoolId).single());
};

export const updateSchoolSettings = async (id: string, settings: any) => {
    const { error } = await supabase.from('schools').update(settings).eq('id', id);
    if (error) throw new Error(error.message);
};

export const getLeadCaptureCampaigns = async () => 
    handleResponse<LeadCaptureCampaign[]>(await supabase.from('lead_capture_campaigns').select('*').order('created_at', { ascending: false }));

export const addLeadCaptureCampaign = async (data: any) => 
    handleResponse<LeadCaptureCampaign>(await supabase.from('lead_capture_campaigns').insert(data).select().single());

export const savePushSubscription = async (subscription: any, userId: string) => {
    const { error } = await supabase.from('push_subscriptions').upsert({ 
        user_id: userId, 
        subscription: subscription,
        updated_at: new Date().toISOString()
    });
    if (error) throw new Error(error.message);
};
