import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';


// --- READ operations ---
// As operações de leitura usam RPCs, que parecem estar funcionando corretamente no backend.
// Manteremos esta parte como está para evitar a reintrodução de erros de "recursão infinita" na leitura.

export const getStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.rpc('get_students');
    if (error) { console.error('Error in getStudents:', error); throw error; }
    return (data || []).sort((a: Student, b: Student) => a.name.localeCompare(b.name));
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.rpc('get_invoices');
    if (error) { console.error('Error in getInvoices:', error); throw error; }
    return (data || []).sort((a: Invoice, b: Invoice) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
};

export const getLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase.rpc('get_leads');
    if (error) { console.error('Error in getLeads:', error); throw error; }
    return (data || []).sort((a: Lead, b: Lead) => new Date(b.interestDate).getTime() - new Date(a.interestDate).getTime());
};

export const getStaff = async (): Promise<Staff[]> => {
    const { data, error } = await supabase.rpc('get_staff');
    if (error) { console.error('Error in getStaff:', error); throw error; }
    return (data || []).sort((a: Staff, b: Staff) => a.name.localeCompare(b.name));
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.rpc('get_users');
    if (error) { console.error('Error in getUsers:', error); throw error; }
    return data || [];
};

export const getAuthenticatedUserProfile = async (): Promise<Staff | string | null> => {
    const { data, error } = await supabase.rpc('get_my_role');
    
    if (error) {
      console.error('Error calling get_my_role RPC:', error);
      return null;
    }
    
    if (data === null || (Array.isArray(data) && data.length === 0)) {
        console.warn("RPC 'get_my_role' did not return a valid profile object.", data);
        return null;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (typeof result === 'object' && result !== null) return result as Staff;
    if (typeof result === 'string' && result.length > 0) return result;

    console.warn("RPC 'get_my_role' returned an unexpected value.", result);
    return null;
};


export const getCommunications = async (): Promise<Communication[]> => {
    const { data, error } = await supabase.rpc('get_communications');
    if (error) { console.error('Error in getCommunications:', error); throw error; }
    return (data || []).sort((a: Communication, b: Communication) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
};

export const getAgendaItems = async (): Promise<AgendaItem[]> => {
    const { data, error } = await supabase.rpc('get_agenda_items');
    if (error) { console.error('Error in getAgendaItems:', error); throw error; }
    return (data || []).sort((a: AgendaItem, b: AgendaItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
    const { data, error } = await supabase.rpc('get_library_books');
    if (error) { console.error('Error in getLibraryBooks:', error); throw error; }
    return data || [];
};

export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => {
    const { data, error } = await supabase.rpc('get_photo_albums');
    if (error) { console.error('Error in getPhotoAlbums:', error); throw error; }
    return (data || []).sort((a: PhotoAlbum, b: PhotoAlbum) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getExpenses = async (): Promise<Expense[]> => {
    const { data, error } = await supabase.rpc('get_expenses');
    if (error) { console.error('Error in getExpenses:', error); throw error; }
    return (data || []).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRevenues = async (): Promise<Revenue[]> => {
    const { data, error } = await supabase.rpc('get_revenues');
    if (error) { console.error('Error in getRevenues:', error); throw error; }
    return (data || []).sort((a: Revenue, b: Revenue) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => {
    const { data, error } = await supabase.rpc('get_lead_capture_campaigns');
    if (error) { console.error('Error in getLeadCaptureCampaigns:', error); throw error; }
    return (data || []).sort((a: LeadCaptureCampaign, b: LeadCaptureCampaign) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// --- WRITE operations (REVERTED to standard Supabase client methods with .select() to get feedback on RLS failures) ---

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => {
    const { data, error } = await supabase.from('students').insert(studentData).select().single();
    if (error) { console.error('Error adding student:', error); throw error; }
    return data;
};
export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => {
    const { data, error } = await supabase.from('students').update(studentData).eq('id', studentId).select().single();
    if (error) { console.error('Error updating student:', error); throw error; }
    return data;
};

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> => {
    const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
    if (error) { console.error('Error adding invoice:', error); throw error; }
    return data;
}
export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> => {
    const { data, error } = await supabase.from('invoices').update(invoiceData).eq('id', invoiceId).select().single();
    if (error) { console.error('Error updating invoice:', error); throw error; }
    return data;
}
export const deleteInvoice = async (invoiceId: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if (error) { console.error('Error deleting invoice:', error); throw error; }
}

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> => {
    const { data, error } = await supabase.from('leads').insert(leadData).select().single();
    if (error) { console.error('Error adding lead:', error); throw error; }
    return data;
}
export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> => {
    const { data, error } = await supabase.from('leads').update(leadData).eq('id', leadId).select().single();
    if (error) { console.error('Error updating lead:', error); throw error; }
    return data;
}

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>): Promise<Staff> => {
    const { data, error } = await supabase.from('staff').insert(staffData).select().single();
    if (error) { console.error('Error adding staff:', error); throw error; }
    return data;
}
export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>): Promise<Staff> => {
    const { data, error } = await supabase.from('staff').update(staffData).eq('id', staffId).select().single();
    if (error) { console.error('Error updating staff:', error); throw error; }
    return data;
}

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const { data, error } = await supabase.from('expenses').insert(expenseData).select().single();
    if (error) { console.error('Error adding expense:', error); throw error; }
    return data;
};
export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>): Promise<Expense> => {
    const { data, error } = await supabase.from('expenses').update(expenseData).eq('id', id).select().single();
    if (error) { console.error('Error updating expense:', error); throw error; }
    return data;
};
export const deleteExpense = async (id: number) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { console.error('Error deleting expense:', error); throw error; }
};

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>): Promise<Revenue> => {
    const { data, error } = await supabase.from('revenues').insert(revenueData).select().single();
    if (error) { console.error('Error adding revenue:', error); throw error; }
    return data;
};
export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>): Promise<Revenue> => {
    const { data, error } = await supabase.from('revenues').update(revenueData).eq('id', id).select().single();
    if (error) { console.error('Error updating revenue:', error); throw error; }
    return data;
};
export const deleteRevenue = async (id: number) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id);
    if (error) { console.error('Error deleting revenue:', error); throw error; }
};

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>): Promise<Communication> => {
    const { data, error } = await supabase.from('communications').insert(commData).select().single();
    if (error) { console.error('Error adding communication:', error); throw error; }
    return data;
};

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>): Promise<AgendaItem> => {
    const { data, error } = await supabase.from('agenda_items').insert(itemData).select().single();
    if (error) { console.error('Error adding agenda item:', error); throw error; }
    return data;
};
export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>): Promise<AgendaItem> => {
    const { data, error } = await supabase.from('agenda_items').update(itemData).eq('id', id).select().single();
    if (error) { console.error('Error updating agenda item:', error); throw error; }
    return data;
};

// Users
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) { console.error('Error adding user:', error); throw error; }
    return data;
};
export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>): Promise<User> => {
    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    if (error) { console.error('Error updating user:', error); throw error; }
    return data;
};
export const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) { console.error('Error deleting user:', error); throw error; }
};

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign): Promise<LeadCaptureCampaign> => {
    const { data, error } = await supabase.from('lead_capture_campaigns').insert(campaignData).select().single();
    if (error) { console.error('Error adding campaign:', error); throw error; }
    return data;
}

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> => {
    const { data, error } = await supabase.from('photo_albums').insert(albumData).select().single();
    if (error) { console.error('Error adding album:', error); throw error; }
    return data;
}
export const deletePhotoAlbum = async (id: number) => {
    const { error } = await supabase.from('photo_albums').delete().eq('id', id);
    if (error) { console.error('Error deleting album:', error); throw error; }
}
export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> => {
    const { data, error } = await supabase.from('photo_albums').update({ photos }).eq('id', albumId).select().single();
    if (error) { console.error('Error updating album photos:', error); throw error; }
    return data;
}

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>): Promise<LibraryBook> => {
    const { data, error } = await supabase.from('library_books').insert(bookData).select().single();
    if (error) { console.error('Error adding book:', error); throw error; }
    return data;
};