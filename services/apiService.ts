import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    User, Expense, Revenue, LeadCaptureCampaign, Photo, StudentColumns, StudentUpdate,
    LeadColumns, LeadUpdate, InvoiceColumns, InvoiceUpdate, PhotoAlbumColumns
} from '../types';
import { supabase } from './supabaseClient';

// Helper for error handling that now also checks for empty data responses
const handleRpcResponse = (response: { data: any, error: any }, context: string) => {
    const { data, error } = response;
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(error.message);
    }
    // This is the crucial new check: if the RPC succeeds but returns no data, it's an application-level error.
    // This catches silent failures from RLS policies.
    if (data === null || (Array.isArray(data) && data.length === 0)) {
        console.error(`Error in ${context}: RPC returned no data. Check RLS policies.`);
        throw new Error(`A operação em '${context}' não retornou dados. Verifique as permissões (RLS) e a função no backend.`);
    }
    return Array.isArray(data) ? data[0] : data;
};


// --- READ operations ---
// Refactored to use RPC calls to bypass restrictive RLS policies that cause "infinite recursion" errors.

export const getStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.rpc('get_students');
    if (error) handleRpcResponse({data, error}, 'getStudents');
    return (data || []).sort((a: Student, b: Student) => a.name.localeCompare(b.name));
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.rpc('get_invoices');
    if (error) handleRpcResponse({data, error}, 'getInvoices');
    return (data || []).sort((a: Invoice, b: Invoice) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
};

export const getLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase.rpc('get_leads');
    if (error) handleRpcResponse({data, error}, 'getLeads');
    return (data || []).sort((a: Lead, b: Lead) => new Date(b.interestDate).getTime() - new Date(a.interestDate).getTime());
};

export const getStaff = async (): Promise<Staff[]> => {
    const { data, error } = await supabase.rpc('get_staff');
    if (error) handleRpcResponse({data, error}, 'getStaff');
    return (data || []).sort((a: Staff, b: Staff) => a.name.localeCompare(b.name));
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.rpc('get_users');
    if (error) handleRpcResponse({data, error}, 'getUsers');
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
    if (error) handleRpcResponse({data, error}, 'getCommunications');
    return (data || []).sort((a: Communication, b: Communication) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
};

export const getAgendaItems = async (): Promise<AgendaItem[]> => {
    const { data, error } = await supabase.rpc('get_agenda_items');
    if (error) handleRpcResponse({data, error}, 'getAgendaItems');
    return (data || []).sort((a: AgendaItem, b: AgendaItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
    const { data, error } = await supabase.rpc('get_library_books');
    if (error) handleRpcResponse({data, error}, 'getLibraryBooks');
    return data || [];
};

export const getPhotoAlbums = async (): Promise<PhotoAlbum[]> => {
    const { data, error } = await supabase.rpc('get_photo_albums');
    if (error) handleRpcResponse({data, error}, 'getPhotoAlbums');
    return (data || []).sort((a: PhotoAlbum, b: PhotoAlbum) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getExpenses = async (): Promise<Expense[]> => {
    const { data, error } = await supabase.rpc('get_expenses');
    if (error) handleRpcResponse({data, error}, 'getExpenses');
    return (data || []).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRevenues = async (): Promise<Revenue[]> => {
    const { data, error } = await supabase.rpc('get_revenues');
    if (error) handleRpcResponse({data, error}, 'getRevenues');
    return (data || []).sort((a: Revenue, b: Revenue) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getLeadCaptureCampaigns = async (): Promise<LeadCaptureCampaign[]> => {
    const { data, error } = await supabase.rpc('get_lead_capture_campaigns');
    if (error) handleRpcResponse({data, error}, 'getLeadCaptureCampaigns');
    return (data || []).sort((a: LeadCaptureCampaign, b: LeadCaptureCampaign) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// --- WRITE operations (ALL refactored to use RPC to bypass RLS) ---

const rpcUpdate = async <T>(rpcName: string, id: number | string, dataToUpdate: object) => {
    const response = await supabase.rpc(rpcName, { p_id: id, p_data: dataToUpdate });
    return handleRpcResponse(response, rpcName);
}

const rpcDelete = async (rpcName: string, id: number | string) => {
    const { error } = await supabase.rpc(rpcName, { p_id: id });
    if (error) {
        console.error(`Error in ${rpcName} (RPC):`, error);
        throw new Error(error.message);
    }
}

// Students
export const addStudent = async (studentData: StudentColumns): Promise<Student> => {
    const response = await supabase.rpc('add_student', { p_student: studentData });
    return handleRpcResponse(response, 'add_student');
};
export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<Student> => {
    return rpcUpdate<Student>('update_student', studentId, studentData);
};

// Invoices
export const addInvoice = async (invoiceData: InvoiceColumns): Promise<Invoice> => {
    const response = await supabase.rpc('add_invoice', { p_invoice: invoiceData });
    return handleRpcResponse(response, 'add_invoice');
}
export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> => {
    return rpcUpdate<Invoice>('update_invoice', invoiceId, invoiceData);
}
export const deleteInvoice = async (invoiceId: string) => {
    return rpcDelete('delete_invoice', invoiceId);
}

// Leads
export const addLead = async (leadData: LeadColumns): Promise<Lead> => {
    const response = await supabase.rpc('add_lead', { p_lead: leadData });
    return handleRpcResponse(response, 'add_lead');
}
export const updateLead = async (leadId: number, leadData: LeadUpdate): Promise<Lead> => {
    return rpcUpdate<Lead>('update_lead', leadId, leadData);
}

// Staff
export const addStaff = async (staffData: Omit<Staff, 'id'>) => {
    const response = await supabase.rpc('add_staff', { p_staff: staffData });
    return handleRpcResponse(response, 'add_staff');
}
export const updateStaff = async (staffId: number, staffData: Partial<Omit<Staff, 'id' | 'school_id'>>) => {
    return rpcUpdate<Staff>('update_staff', staffId, staffData);
}

// Expenses
export const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const response = await supabase.rpc('add_expense', { p_expense: expenseData });
    return handleRpcResponse(response, 'add_expense');
};
export const updateExpense = async (id: number, expenseData: Partial<Omit<Expense, 'id' | 'school_id'>>) => {
    return rpcUpdate<Expense>('update_expense', id, expenseData);
};
export const deleteExpense = async (id: number) => {
    return rpcDelete('delete_expense', id);
};

// Revenues
export const addRevenue = async (revenueData: Omit<Revenue, 'id'>) => {
    const response = await supabase.rpc('add_revenue', { p_revenue: revenueData });
    return handleRpcResponse(response, 'add_revenue');
};
export const updateRevenue = async (id: number, revenueData: Partial<Omit<Revenue, 'id' | 'school_id'>>) => {
    return rpcUpdate<Revenue>('update_revenue', id, revenueData);
};
export const deleteRevenue = async (id: number) => {
    return rpcDelete('delete_revenue', id);
};

// Communications
export const addCommunication = async (commData: Omit<Communication, 'id'>) => {
    const response = await supabase.rpc('add_communication', { p_communication: commData });
    return handleRpcResponse(response, 'add_communication');
};

// Agenda
export const addAgendaItem = async (itemData: Omit<AgendaItem, 'id'>) => {
    const response = await supabase.rpc('add_agenda_item', { p_item: itemData });
    return handleRpcResponse(response, 'add_agenda_item');
};
export const updateAgendaItem = async (id: number, itemData: Partial<Omit<AgendaItem, 'id' | 'school_id'>>) => {
    return rpcUpdate<AgendaItem>('update_agenda_item', id, itemData);
};

// Users
export const addUser = async (userData: Omit<User, 'id'>) => {
    const response = await supabase.rpc('add_user', { p_user: userData });
    return handleRpcResponse(response, 'add_user');
};
export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'school_id'>>) => {
    return rpcUpdate<User>('update_user', id, userData);
};
export const deleteUser = async (id: string) => {
    return rpcDelete('delete_user', id);
};

// Campaigns
export const addLeadCaptureCampaign = async (campaignData: LeadCaptureCampaign) => {
    const response = await supabase.rpc('add_lead_capture_campaign', { p_campaign: campaignData });
    return handleRpcResponse(response, 'add_lead_capture_campaign');
}

// Photo Albums
export const addPhotoAlbum = async (albumData: PhotoAlbumColumns): Promise<PhotoAlbum> => {
    const response = await supabase.rpc('add_photo_album', { p_album: albumData });
    return handleRpcResponse(response, 'add_photo_album');
}
export const deletePhotoAlbum = async (id: number) => {
    return rpcDelete('delete_photo_album', id);
}
export const updateAlbumPhotos = async (albumId: number, photos: Photo[]): Promise<PhotoAlbum> => {
    const response = await supabase.rpc('update_album_photos', { p_id: albumId, p_photos: photos });
    return handleRpcResponse(response, 'update_album_photos');
}

// Library
export const addLibraryBook = async (bookData: Omit<LibraryBook, 'id'>) => {
    const response = await supabase.rpc('add_library_book', { p_book: bookData });
    return handleRpcResponse(response, 'add_library_book');
};