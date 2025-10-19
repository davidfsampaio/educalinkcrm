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
// Refactored to use RPC calls to bypass restrictive RLS policies that cause "infinite recursion" errors.

export const getStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.rpc('get_students');
    handleSupabaseError(error, 'getStudents');
    return (data || []).sort((a: Student, b: Student) => a.name.localeCompare(b.name));
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.rpc('get_invoices');
    handleSupabaseError(error, 'getInvoices');
    return (data || []).sort((a: Invoice, b: Invoice) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
};

export const getLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase.rpc('get_leads');
    handleSupabaseError(error, 'getLeads');
    return (data || []).sort((a: Lead, b: Lead) => new Date(b.interestDate).getTime() - new Date(a.interestDate).getTime());
};

export const getStaff = async (): Promise<Staff[]> => {
    const { data, error } = await supabase.rpc('get_staff');
    handleSupabaseError(error, 'getStaff');
    return (data || []).sort((a: Staff, b: Staff) => a.name.localeCompare(b.name));
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.rpc('get_users');
    handleSupabaseError(error, 'getUsers');
    return data || [];
};

export const getAuthenticatedUserProfile = async (): Promise<Staff | string | null> => {
    const { data, error } = await supabase.rpc('get_my_role');
    
    if (error) {
      console.error('Error calling get_my_role RPC:', error);
      return null;
    }
    
    if (data === null || (Array.isArray(data) && data.length === 0)) {
        return null;
    }

    const result = Array.isArray(data) ? data[0] : data;

    // Case 1: RPC returns the full profile object (ideal)
    if (typeof result === 'object' && result !== null) {
        return result as Staff;
    }
    
    // Case 2: RPC returns just the role name as a string
    if (typeof result === 'string' && result.length > 0) {
        return result;
    }

    console.warn("RPC 'get_my_role' returned an unexpected value.", result);
    return null;
};


export const getCommunications = async (): Promise<Communication[]> => {
    const { data, error } = await supabase.rpc('get_communications');
    handleSupabaseError(error, 'getCommunications');
    return (data || []).sort((a: Communication, b: Communication) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
};

export const getAgendaItems = async (): Promise<AgendaItem[]> => {
    const { data, error } = await supabase.rpc('get_agenda_items');
    handleSupabaseError(error, 'getAgendaItems');
    return (data || []).sort((a: AgendaItem, b: AgendaItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
    const { data, error } = await supabase.rpc('get_library_books');
    handleSupabaseError(error, 'getLibraryBooks');
    return data || [];
};

export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => {
    const { data, error } = await supabase.rpc('get_photo_albums');
    handleSupabaseError(error, 'getPhotoAlbums');
    return (data || []).sort((a: PhotoAlbum, b: PhotoAlbum) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getExpenses = async (): Promise<Expense[]> => {
    const { data, error } = await supabase.rpc('get_expenses');
    handleSupabaseError(error, 'getExpenses');
    return (data || []).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRevenues = async (): Promise<Revenue[]> => {
    const { data, error } = await supabase.rpc('get_revenues');
    handleSupabaseError(error, 'getRevenues');
    return (data || []).sort((a: Revenue, b: Revenue) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => {
    const { data, error } = await supabase.rpc('get_lead_capture_campaigns');
    handleSupabaseError(error, 'getLeadCaptureCampaigns');
    return (data || []).sort((a: LeadCaptureCampaign, b: LeadCaptureCampaign) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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