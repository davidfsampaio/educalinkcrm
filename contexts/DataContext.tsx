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

    // Effect for syncing data across tabs
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


    const addStudent = async (studentData: Omit<Student, 'id'|'status'|'enrollmentDate'|'avatarUrl'|'grades'|'attendance'|'occurrences'|'documents'|'individualAgenda'|'communicationLog'|'tuitionPlanId'|'medicalNotes'>) => {
        const newStudent: Student = {
            id: Date.now(),
            ...studentData,
            tuitionPlanId: 1,
            medicalNotes: '',
            status: StudentStatus.Active,
            enrollmentDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://picsum.photos/seed/student${Date.now()}/100/100`,
            grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [],
        };
        const newStudents = [newStudent, ...students];
        setStudents(newStudents);
        await api.saveStudents(newStudents);
    };

    const updateStudent = async (updatedStudent: Student) => {
        const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
        setStudents(newStudents);
        await api.saveStudents(newStudents);
    };

    const addLead = async (leadData: Omit<Lead, 'id'>, campaignId?: string) => {
        const newLead: Lead = {
            id: Date.now(),
            ...leadData,
        };
        const newLeads = [newLead, ...leads];
        setLeads(newLeads);
        await api.saveLeads(newLeads);

        if (campaignId) {
            const newCampaigns = leadCaptureCampaigns.map(c => 
                c.id === campaignId ? { ...c, leadsCaptured: c.leadsCaptured + 1 } : c
            );
            setLeadCaptureCampaigns(newCampaigns);
            await api.saveLeadCaptureCampaigns(newCampaigns);
        }
    };
    
    const updateLead = async (updatedLead: Lead) => {
        const newLeads = leads.map(l => (l.id === updatedLead.id ? updatedLead : l));
        setLeads(newLeads);
        await api.saveLeads(newLeads);
    };

    const addLeadCaptureCampaign = async (campaign: LeadCaptureCampaign) => {
        const newCampaigns = [campaign, ...leadCaptureCampaigns];
        setLeadCaptureCampaigns(newCampaigns);
        await api.saveLeadCaptureCampaigns(newCampaigns);
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
        setInvoices(newInvoices);
        await api.saveInvoices(newInvoices);
    };
    
    const updateInvoice = async (updatedInvoice: Invoice) => {
        const newInvoices = invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
        setInvoices(newInvoices);
        await api.saveInvoices(newInvoices);
    };

    const deleteInvoice = async (invoiceId: string) => {
        const newInvoices = invoices.filter(inv => inv.id !== invoiceId);
        setInvoices(newInvoices);
        await api.saveInvoices(newInvoices);
    };

    const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { id: Date.now(), ...expenseData };
        const newExpenses = [newExpense, ...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(newExpenses);
        await api.saveExpenses(newExpenses);
    };
    
    const updateExpense = async (updatedExpense: Expense) => {
        const newExpenses = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(newExpenses);
        await api.saveExpenses(newExpenses);
    };

    const deleteExpense = async (expenseId: number) => {
        const newExpenses = expenses.filter(e => e.id !== expenseId);
        setExpenses(newExpenses);
        await api.saveExpenses(newExpenses);
    };

    const addRevenue = async (revenueData: Omit<Revenue, 'id'>) => {
        const newRevenue: Revenue = { id: Date.now(), ...revenueData };
        const newRevenues = [newRevenue, ...revenues].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRevenues(newRevenues);
        await api.saveRevenues(newRevenues);
    };

    const updateRevenue = async (updatedRevenue: Revenue) => {
        const newRevenues = revenues.map(r => r.id === updatedRevenue.id ? updatedRevenue : r).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRevenues(newRevenues);
        await api.saveRevenues(newRevenues);
    };

    const deleteRevenue = async (revenueId: number) => {
        const newRevenues = revenues.filter(r => r.id !== revenueId);
        setRevenues(newRevenues);
        await api.saveRevenues(newRevenues);
    };


    const addStaff = async (staffData: Omit<Staff, 'id' | 'status' | 'hireDate' | 'avatarUrl'>) => {
        const newStaff: Staff = {
            id: Date.now(), ...staffData, status: StaffStatus.Active,
            hireDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://picsum.photos/seed/staff${Date.now()}/100/100`,
        };
        const newStaffList = [newStaff, ...staff];
        setStaff(newStaffList);
        await api.saveStaff(newStaffList);
    };

    const updateStaff = async (updatedStaff: Staff) => {
        const newStaffList = staff.map(s => s.id === updatedStaff.id ? updatedStaff : s);
        setStaff(newStaffList);
        await api.saveStaff(newStaffList);
    };

    const addCommunication = async (commData: Omit<Communication, 'id' | 'sentDate'>) => {
        const newComm: Communication = { id: Date.now(), ...commData, sentDate: new Date().toISOString() };
        const newComms = [newComm, ...communications];
        setCommunications(newComms);
        await api.saveCommunications(newComms);
    };

    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'isSent'>) => {
        const newItem: AgendaItem = { id: Date.now(), ...itemData, isSent: false };
        const newItems = [newItem, ...agendaItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAgendaItems(newItems);
        await api.saveAgendaItems(newItems);
    };
    
    const updateAgendaItem = async (updatedItem: AgendaItem) => {
        const newItems = agendaItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        setAgendaItems(newItems);
        await api.saveAgendaItems(newItems);
    };
    
    const addUser = async (userData: Omit<User, 'id' | 'avatarUrl' | 'status'>) => {
        const newUser: User = {
            id: Date.now(), ...userData, status: UserStatus.Active,
            avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`,
        };
        const newUsers = [newUser, ...users];
        setUsers(newUsers);
        await api.saveUsers(newUsers);
    };

    const updateUser = async (updatedUser: User) => {
        const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        setUsers(newUsers);
        await api.saveUsers(newUsers);
    };

    const deleteUser = async (userId: number) => {
        const newUsers = users.filter(u => u.id !== userId);
        setUsers(newUsers);
        await api.saveUsers(newUsers);
    };
    
    const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id' | 'photos'>) => {
        const newAlbum: PhotoAlbum = {
            id: Date.now(),
            ...albumData,
            photos: [],
        };
        const newAlbums = [newAlbum, ...photoAlbums];
        setPhotoAlbums(newAlbums);
        await api.savePhotoAlbums(newAlbums);
    };
    
    const deletePhotoAlbum = async (albumId: number) => {
        const newAlbums = photoAlbums.filter(album => album.id !== albumId);
        setPhotoAlbums(newAlbums);
        await api.savePhotoAlbums(newAlbums);
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
        setPhotoAlbums(newAlbums);
        await api.savePhotoAlbums(newAlbums);
    };
    
    const deletePhotoFromAlbum = async (albumId: number, photoId: number) => {
        const newAlbums = photoAlbums.map(album => {
            if (album.id === albumId) {
                return { ...album, photos: album.photos.filter(p => p.id !== photoId) };
            }
            return album;
        });
        // Also update the selected album if it's being viewed, to reflect the change immediately
        setPhotoAlbums(newAlbums);
        await api.savePhotoAlbums(newAlbums);
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