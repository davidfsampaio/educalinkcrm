
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// FIX: Added missing StaffStatus and UserStatus imports.
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign, LeadStatus, StudentStatus, PaymentStatus, StaffStatus, UserStatus, Photo, DataContextType } from '../types';
import * as api from '../services/apiService';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [communications, setCommunications] = useState<Communication[]>([]);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
    const [photoAlbums, setPhotoAlbums] = useState<PhotoAlbum[]>([]);
    const [financialSummary, setFinancialSummary] = useState<FinancialSummaryPoint[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [leadCaptureCampaigns, setLeadCaptureCampaigns] = useState<LeadCaptureCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [
                studentsData,
                invoicesData,
                leadsData,
                staffData,
                usersData,
                communicationsData,
                agendaData,
                libraryData,
                albumData,
                financialData,
                expensesData,
                revenuesData,
                campaignsData,
            ] = await Promise.all([
                api.getStudents(),
                api.getInvoices(),
                api.getLeads(),
                api.getStaff(),
                api.getUsers(),
                api.getCommunications(),
                api.getAgendaItems(),
                api.getLibraryBooks(),
                api.getPhotoAlbums(),
                api.getFinancialSummary(),
                api.getExpenses(),
                api.getRevenues(),
                api.getLeadCaptureCampaigns(),
            ]);
            setStudents(studentsData);
            setInvoices(invoicesData);
            setLeads(leadsData);
            setStaff(staffData);
            setUsers(usersData);
            setCommunications(communicationsData);
            setAgendaItems(agendaData);
            setLibraryBooks(libraryData);
            setPhotoAlbums(albumData);
            setFinancialSummary(financialData);
            setExpenses(expensesData);
            setRevenues(revenuesData);
            setLeadCaptureCampaigns(campaignsData);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }, []);

    // Effect for initial data load
    useEffect(() => {
        loadData().finally(() => setLoading(false));
    }, [loadData]);

    // Effect for syncing data across tabs (less relevant now with a backend)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            const crmKeys = ['students', 'invoices', 'leads', 'staff', 'users', 'communications', 'agendaItems', 'expenses', 'revenues', 'leadCaptureCampaigns', 'photoAlbums'];
            if (event.key && crmKeys.includes(event.key)) {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadData]);


    const addStudent = (studentData: Omit<Student, 'id'|'status'|'enrollmentDate'|'avatarUrl'|'grades'|'attendance'|'occurrences'|'documents'|'individualAgenda'|'communicationLog'|'tuitionPlanId'|'medicalNotes'>) => {
        const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        const newStudent: Student = {
            ...studentData,
            id: newId,
            status: StudentStatus.Active,
            enrollmentDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://picsum.photos/seed/student${newId}/100/100`,
            grades: [],
            attendance: [],
            occurrences: [],
            documents: [],
            individualAgenda: [],
            communicationLog: [],
            tuitionPlanId: 1, // Defaulting to plan 1
        };

        setStudents(prev => [newStudent, ...prev]);
    };

    const updateStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
    };

    const addLead = async (leadData: Omit<Lead, 'id'>, campaignId?: string) => {
        const newLead: Lead = { id: Date.now(), ...leadData };
        const newLeads = [newLead, ...leads];
        // TODO: Refactor to use Supabase insert
        // await api.saveLeads(newLeads);
        setLeads(newLeads);
        console.warn('addLead needs to be refactored for Supabase');
    };
    
    const updateLead = async (updatedLead: Lead) => {
        const newLeads = leads.map(l => (l.id === updatedLead.id ? updatedLead : l));
        // TODO: Refactor to use Supabase update
        // await api.saveLeads(newLeads);
        setLeads(newLeads);
        console.warn('updateLead needs to be refactored for Supabase');
    };

    const addLeadCaptureCampaign = async (campaign: LeadCaptureCampaign) => {
        const newCampaigns = [campaign, ...leadCaptureCampaigns];
        // TODO: Refactor to use Supabase insert
        // await api.saveLeadCaptureCampaigns(newCampaigns);
        setLeadCaptureCampaigns(newCampaigns);
        console.warn('addLeadCaptureCampaign needs to be refactored for Supabase');
    };
    
    const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => {
        const student = students.find(s => s.id === newInvoiceData.studentId);
        if (!student) return;

        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`, ...newInvoiceData, studentName: student.name,
            status: new Date(newInvoiceData.dueDate) < new Date() ? PaymentStatus.Overdue : PaymentStatus.Pending,
            payments: [],
        };
        const newInvoices = [newInvoice, ...invoices];
        // TODO: Refactor to use Supabase insert
        // await api.saveInvoices(newInvoices);
        setInvoices(newInvoices);
         console.warn('addInvoice needs to be refactored for Supabase');
    };
    
    const updateInvoice = async (updatedInvoice: Invoice) => {
        const newInvoices = invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
        // TODO: Refactor to use Supabase update
        // await api.saveInvoices(newInvoices);
        setInvoices(newInvoices);
        console.warn('updateInvoice needs to be refactored for Supabase');
    };

    const deleteInvoice = async (invoiceId: string) => {
        const newInvoices = invoices.filter(inv => inv.id !== invoiceId);
        // TODO: Refactor to use Supabase delete
        // await api.saveInvoices(newInvoices);
        setInvoices(newInvoices);
        console.warn('deleteInvoice needs to be refactored for Supabase');
    };

    const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { id: Date.now(), ...expenseData };
        const newExpenses = [newExpense, ...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // TODO: Refactor to use Supabase insert
        // await api.saveExpenses(newExpenses);
        setExpenses(newExpenses);
        console.warn('addExpense needs to be refactored for Supabase');
    };
    
    const updateExpense = async (updatedExpense: Expense) => {
        const newExpenses = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // TODO: Refactor to use Supabase update
        // await api.saveExpenses(newExpenses);
        setExpenses(newExpenses);
        console.warn('updateExpense needs to be refactored for Supabase');
    };

    const deleteExpense = async (expenseId: number) => {
        const newExpenses = expenses.filter(e => e.id !== expenseId);
        // TODO: Refactor to use Supabase delete
        // await api.saveExpenses(newExpenses);
        setExpenses(newExpenses);
        console.warn('deleteExpense needs to be refactored for Supabase');
    };

    const addRevenue = async (revenueData: Omit<Revenue, 'id'>) => {
        const newRevenue: Revenue = { id: Date.now(), ...revenueData };
        const newRevenues = [newRevenue, ...revenues].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // TODO: Refactor to use Supabase insert
        // await api.saveRevenues(newRevenues);
        setRevenues(newRevenues);
        console.warn('addRevenue needs to be refactored for Supabase');
    };

    const updateRevenue = async (updatedRevenue: Revenue) => {
        const newRevenues = revenues.map(r => r.id === updatedRevenue.id ? updatedRevenue : r).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // TODO: Refactor to use Supabase update
        // await api.saveRevenues(newRevenues);
        setRevenues(newRevenues);
        console.warn('updateRevenue needs to be refactored for Supabase');
    };

    const deleteRevenue = async (revenueId: number) => {
        const newRevenues = revenues.filter(r => r.id !== revenueId);
        // TODO: Refactor to use Supabase delete
        // await api.saveRevenues(newRevenues);
        setRevenues(newRevenues);
        console.warn('deleteRevenue needs to be refactored for Supabase');
    };


    const addStaff = async (staffData: Omit<Staff, 'id' | 'status' | 'hireDate' | 'avatarUrl'>) => {
        const newStaff: Staff = {
            id: Date.now(), ...staffData, status: StaffStatus.Active,
            hireDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://picsum.photos/seed/staff${Date.now()}/100/100`,
        };
        const newStaffList = [newStaff, ...staff];
        // TODO: Refactor to use Supabase insert
        // await api.saveStaff(newStaffList);
        setStaff(newStaffList);
        console.warn('addStaff needs to be refactored for Supabase');
    };

    const updateStaff = async (updatedStaff: Staff) => {
        const newStaffList = staff.map(s => s.id === updatedStaff.id ? updatedStaff : s);
        // TODO: Refactor to use Supabase update
        // await api.saveStaff(newStaffList);
        setStaff(newStaffList);
        console.warn('updateStaff needs to be refactored for Supabase');
    };

    const addCommunication = async (commData: Omit<Communication, 'id' | 'sentDate'>) => {
        const newComm: Communication = { id: Date.now(), ...commData, sentDate: new Date().toISOString() };
        const newComms = [newComm, ...communications];
        // TODO: Refactor to use Supabase insert
        // await api.saveCommunications(newComms);
        setCommunications(newComms);
        console.warn('addCommunication needs to be refactored for Supabase');
    };

    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'isSent'>) => {
        const newItem: AgendaItem = { id: Date.now(), ...itemData, isSent: false };
        const newItems = [newItem, ...agendaItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // TODO: Refactor to use Supabase insert
        // await api.saveAgendaItems(newItems);
        setAgendaItems(newItems);
        console.warn('addAgendaItem needs to be refactored for Supabase');
    };
    
    const updateAgendaItem = async (updatedItem: AgendaItem) => {
        const newItems = agendaItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        // TODO: Refactor to use Supabase update
        // await api.saveAgendaItems(newItems);
        setAgendaItems(newItems);
        console.warn('updateAgendaItem needs to be refactored for Supabase');
    };
    
    const addUser = async (userData: Omit<User, 'id' | 'avatarUrl' | 'status'>) => {
        const newUser: User = {
            id: Date.now(), ...userData, status: UserStatus.Active,
            avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`,
        };
        const newUsers = [newUser, ...users];
        // TODO: Refactor to use Supabase insert
        // await api.saveUsers(newUsers);
        setUsers(newUsers);
        console.warn('addUser needs to be refactored for Supabase');
    };

    const updateUser = async (updatedUser: User) => {
        const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        // TODO: Refactor to use Supabase update
        // await api.saveUsers(newUsers);
        setUsers(newUsers);
        console.warn('updateUser needs to be refactored for Supabase');
    };

    const deleteUser = async (userId: number) => {
        const newUsers = users.filter(u => u.id !== userId);
        // TODO: Refactor to use Supabase delete
        // await api.saveUsers(newUsers);
        setUsers(newUsers);
        console.warn('deleteUser needs to be refactored for Supabase');
    };
    
    const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id' | 'photos'>) => {
        const newAlbum: PhotoAlbum = {
            id: Date.now(),
            ...albumData,
            photos: [],
        };
        const newAlbums = [newAlbum, ...photoAlbums];
        // TODO: Refactor to use Supabase insert
        // await api.savePhotoAlbums(newAlbums);
        setPhotoAlbums(newAlbums);
        console.warn('addPhotoAlbum needs to be refactored for Supabase');
    };
    
    const deletePhotoAlbum = async (albumId: number) => {
        const newAlbums = photoAlbums.filter(album => album.id !== albumId);
        // TODO: Refactor to use Supabase delete
        // await api.savePhotoAlbums(newAlbums);
        setPhotoAlbums(newAlbums);
        console.warn('deletePhotoAlbum needs to be refactored for Supabase');
    };

    const addPhotoToAlbum = async (albumId: number, photoData: { url: string; caption: string }) => {
        const newPhoto: Photo = {
            id: Date.now(),
            ...photoData,
        };
        const newAlbums = photoAlbums.map(album => {
            if (album.id === albumId) {
                return { ...album, photos: [...album.photos, newPhoto] };
            }
            return album;
        });
        // TODO: Refactor to use Supabase update
        // await api.savePhotoAlbums(newAlbums);
        setPhotoAlbums(newAlbums);
        console.warn('addPhotoToAlbum needs to be refactored for Supabase');
    };
    
    const deletePhotoFromAlbum = async (albumId: number, photoId: number) => {
        const newAlbums = photoAlbums.map(album => {
            if (album.id === albumId) {
                return { ...album, photos: album.photos.filter(p => p.id !== photoId) };
            }
            return album;
        });
         // TODO: Refactor to use Supabase update
        // await api.savePhotoAlbums(newAlbums);
        setPhotoAlbums(newAlbums);
        console.warn('deletePhotoFromAlbum needs to be refactored for Supabase');
    };

    const value: DataContextType = { 
        students, invoices, leads, staff, users, communications, agendaItems, libraryBooks, photoAlbums, financialSummary, expenses, revenues, leadCaptureCampaigns, loading, 
        addStudent, updateStudent, addLead, updateLead, addInvoice, updateInvoice, deleteInvoice, 
        addExpense, updateExpense, deleteExpense,
        addRevenue, updateRevenue, deleteRevenue,
        addStaff, updateStaff, addCommunication, addAgendaItem, updateAgendaItem,
        addUser, updateUser, deleteUser, addLeadCaptureCampaign,
        addPhotoAlbum, deletePhotoAlbum, addPhotoToAlbum, deletePhotoFromAlbum
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
