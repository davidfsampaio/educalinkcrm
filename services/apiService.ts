import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo
} from '../types';
import { supabase } from './supabaseClient';

// Helper for error handling
const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(error.message);
    }
};

// --- READ operations ---
// Note: With Row Level Security (RLS) enabled, these simple 'select *' queries
// are automatically and securely filtered by Supabase on the backend.
// We don't need to add 'where("school_id", ...)' clauses here.

export const getStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*').order('name');
    handleSupabaseError(error, 'getStudents');
    return data || [];
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*').order('dueDate', { ascending: false });
    handleSupabaseError(error, 'getInvoices');
    return data || [];
};

export const getLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase.from('leads').select('*').order('interestDate', { ascending: false });
    handleSupabaseError(error, 'getLeads');
    return data || [];
};

export const getStaff = async (): Promise<Staff[]> => {
    const { data, error } = await supabase.from('staff').select('*').order('name');
    handleSupabaseError(error, 'getStaff');
    return data || [];
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    handleSupabaseError(error, 'getUsers');
    return data || [];
};

export const getUserProfileRpc = async (): Promise<Staff | null> => {
    // We assume an RPC function 'get_user_profile' exists on the backend.
    // This function should securely fetch the staff profile for the currently authenticated user,
    // bypassing potential RLS recursion issues found in direct table queries.
    const { data, error } = await supabase.rpc('get_user_profile');
    
    if (error) {
      console.error('Error calling getUserProfileRpc:', error);
       // Don't throw for 'not found' style errors, just return null
      return null;
    }
    
    // The rpc call might return an array with one item, or just the item, or nothing.
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return null;
    }

    // If it returns an array, take the first element.
    return Array.isArray(data) ? data[0] : data;
};


export const getStaffProfileByEmail = async (email: string): Promise<Staff | null> => {
    const { data, error } = await supabase.from('staff').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching staff profile by email:', error);
        return null;
    }
    return data;
};

export const getUserProfileByEmail = async (email: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user profile by email:', error);
        return null;
    }
    return data;
};

export const getUserProfileById = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user profile by id:', error);
        return null;
    }
    return data;
};

export const getCommunications = async (): Promise<Communication[]> => {
    const { data, error } = await supabase.from('communications').select('*').order('sentDate', { ascending: false });
    handleSupabaseError(error, 'getCommunications');
    return data || [];
};

export const getAgendaItems = async (): Promise<AgendaItem[]> => {
    const { data, error } = await supabase.from('agenda_items').select('*').order('date', { ascending: false });
    handleSupabaseError(error, 'getAgendaItems');
    return data || [];
};

export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
    const { data, error } = await supabase.from('library_books').select('*');
    handleSupabaseError(error, 'getLibraryBooks');
    return data || [];
};

export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => {
    const { data, error } = await supabase.from('photo_albums').select('*').order('date', { ascending: false });
    handleSupabaseError(error, 'getPhotoAlbums');
    return data || [];
};

export const getExpenses = async (): Promise<Expense[]> => {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    handleSupabaseError(error, 'getExpenses');
    return data || [];
};

export const getRevenues = async (): Promise<Revenue[]> => {
    const { data, error } = await supabase.from('revenues').select('*').order('date', { ascending: false });
    handleSupabaseError(error, 'getRevenues');
    return data || [];
};

export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => {
    const { data, error } = await supabase.from('lead_capture_campaigns').select('*').order('createdAt', { ascending: false });
    handleSupabaseError(error, 'getLeadCaptureCampaigns');
    return data || [];
};


// --- WRITE operations ---

// Students
export const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const { data, error } = await supabase.from('students').insert(studentData).select().single();
    handleSupabaseError(error, 'addStudent');
    return data;
};
export const updateStudent = async (studentId: number, studentData: Partial<Omit<Student, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('students').update(studentData).eq('id', studentId).select().single();
    handleSupabaseError(error, 'updateStudent');
    return data;
};

// Invoices
export const addInvoice = async (invoiceData: Omit<Invoice, 'school_id'>) => {
    const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
    handleSupabaseError(error, 'addInvoice');
    return data;
}
export const updateInvoice = async (invoiceId: string, invoiceData: Partial<Omit<Invoice, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('invoices').update(invoiceData).eq('id', invoiceId).select().single();
    handleSupabaseError(error, 'updateInvoice');
    return data;
}
export const deleteInvoice = async (invoiceId: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    handleSupabaseError(error, 'deleteInvoice');
}

// Leads
export const addLead = async (leadData: Omit<Lead, 'id'>) => {
    const { data, error } = await supabase.from('leads').insert(leadData).select().single();
    handleSupabaseError(error, 'addLead');
    return data;
}
export const updateLead = async (leadId: number, leadData: Partial<Omit<Lead, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('leads').update(leadData).eq('id', leadId).select().single();
    handleSupabaseError(error, 'updateLead');
    return data;
}

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>) => {
    const { data, error } = await supabase.from('staff').insert(staffData).select().single();
    handleSupabaseError(error, 'addStaff');
    return data;
}
export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('staff').update(staffData).eq('id', staffId).select().single();
    handleSupabaseError(error, 'updateStaff');
    return data;
}

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const { data, error } = await supabase.from('expenses').insert(expenseData).select().single();
    handleSupabaseError(error, 'addExpense');
    return data;
};
export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('expenses').update(expenseData).eq('id', id).select().single();
    handleSupabaseError(error, 'updateExpense');
    return data;
};
export const deleteExpense = async (id: number) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    handleSupabaseError(error, 'deleteExpense');
};

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>) => {
    const { data, error } = await supabase.from('revenues').insert(revenueData).select().single();
    handleSupabaseError(error, 'addRevenue');
    return data;
};
export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('revenues').update(revenueData).eq('id', id).select().single();
    handleSupabaseError(error, 'updateRevenue');
    return data;
};
export const deleteRevenue = async (id: number) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id);
    handleSupabaseError(error, 'deleteRevenue');
};

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>) => {
    const { data, error } = await supabase.from('communications').insert(commData).select().single();
    handleSupabaseError(error, 'addCommunication');
    return data;
};

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>) => {
    const { data, error } = await supabase.from('agenda_items').insert(itemData).select().single();
    handleSupabaseError(error, 'addAgendaItem');
    return data;
};
export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('agenda_items').update(itemData).eq('id', id).select().single();
    handleSupabaseError(error, 'updateAgendaItem');
    return data;
};

// Users
export const addUser = async (userData: Omit<User, 'id'>) => {
    // This would be handled by a server-side function in a real multi-tenant app
    // to securely associate the new auth user with a profile.
    // For now, we insert directly.
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    handleSupabaseError(error, 'addUser');
    return data;
};
export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>) => {
    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    handleSupabaseError(error, 'updateUser');
    return data;
};
export const deleteUser = async (id: string) => {
    // This should also be a secure server-side function
    const { error } = await supabase.from('users').delete().eq('id', id);
    handleSupabaseError(error, 'deleteUser');
};

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign) => {
    const { data, error } = await supabase.from('lead_capture_campaigns').insert(campaignData).select().single();
    handleSupabaseError(error, 'addLeadCaptureCampaign');
    return data;
}

// Photo Albums
export const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id'>) => {
    const { data, error } = await supabase.from('photo_albums').insert(albumData).select().single();
    handleSupabaseError(error, 'addPhotoAlbum');
    return data;
}
export const deletePhotoAlbum = async (id: number) => {
    const { error } = await supabase.from('photo_albums').delete().eq('id', id);
    handleSupabaseError(error, 'deletePhotoAlbum');
}
export const updateAlbumPhotos = async (albumId: number, photos: Photo[]) => {
    const { data, error } = await supabase.from('photo_albums').update({ photos }).eq('id', albumId).select().single();
    handleSupabaseError(error, 'updateAlbumPhotos');
    return data;
}

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>) => {
    const { data, error } = await supabase.from('library_books').insert(bookData).select().single();
    handleSupabaseError(error, 'addLibraryBook');
    return data;
};