
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
        setLoading(true);
        try {
            const [
                studentsData, invoicesData, leadsData, staffData, usersData,
                communicationsData, agendaData, libraryData, albumData,
                financialData, expensesData, revenuesData, campaignsData,
            ] = await Promise.all([
                api.getStudents(), api.getInvoices(), api.getLeads(), api.getStaff(), api.getUsers(),
                api.getCommunications(), api.getAgendaItems(), api.getLibraryBooks(), api.getPhotoAlbums(),
                api.getFinancialSummary(), api.getExpenses(), api.getRevenues(), api.getLeadCaptureCampaigns(),
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
            console.error("Failed to load data from Supabase", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addStudent = async (studentData: Omit<Student, 'id' | 'status' | 'enrollmentDate' | 'avatarUrl' | 'grades' | 'attendance' | 'occurrences' | 'documents' | 'individualAgenda' | 'communicationLog' | 'tuitionPlanId' | 'medicalNotes'>) => {
        try {
            const newStudentPayload: Omit<Student, 'id'> = {
                ...studentData,
                status: StudentStatus.Active,
                enrollmentDate: new Date().toISOString().split('T')[0],
                avatarUrl: `https://picsum.photos/seed/student${Date.now()}/100/100`,
                grades: [], attendance: [], occurrences: [], documents: [],
                individualAgenda: [], communicationLog: [], tuitionPlanId: 1, medicalNotes: ''
            };
            const newStudent = await api.addStudent(newStudentPayload);
            if (newStudent) {
                setStudents(prev => [newStudent, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add student:', error);
        }
    };

    const updateStudent = async (updatedStudent: Student) => {
        try {
            const { id, ...studentData } = updatedStudent;
            const updated = await api.updateStudent(id, studentData);
            if (updated) {
                setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
            }
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };
    
    const addLead = async (leadData: Omit<Lead, 'id'>, campaignId?: string) => {
        try {
            const newLead = await api.addLead(leadData);
            if (newLead) {
                setLeads(prev => [newLead, ...prev]);
                if (campaignId) {
                    // In a real app, you might increment the campaign counter
                    console.log(`Lead added to campaign ${campaignId}`);
                }
            }
        } catch(error) {
            console.error("Failed to add lead:", error);
        }
    };
    
    const updateLead = async (updatedLead: Lead) => {
        try {
             const { id, ...leadData } = updatedLead;
            const updated = await api.updateLead(id, leadData);
            if (updated) {
                setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
            }
        } catch(error) {
            console.error("Failed to update lead:", error);
        }
    };

    const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => {
        try {
            const student = students.find(s => s.id === newInvoiceData.studentId);
            if (!student) throw new Error("Student not found");

            const payload: Omit<Invoice, 'id'> = {
                ...newInvoiceData,
                studentName: student.name,
                status: new Date(newInvoiceData.dueDate) < new Date() ? PaymentStatus.Overdue : PaymentStatus.Pending,
                payments: [],
            };
            const newInvoice = await api.addInvoice(payload);
            if (newInvoice) {
                setInvoices(prev => [newInvoice, ...prev]);
            }
        } catch(error) {
            console.error("Failed to add invoice:", error);
        }
    };

    const updateInvoice = async (updatedInvoice: Invoice) => {
        try {
            const { id, ...invoiceData } = updatedInvoice;
            const updated = await api.updateInvoice(id, invoiceData);
            if(updated) {
                setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
            }
        } catch(error) {
            console.error("Failed to update invoice:", error);
        }
    };

    const deleteInvoice = async (invoiceId: string) => {
        try {
            await api.deleteInvoice(invoiceId);
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        } catch(error) {
            console.error("Failed to delete invoice:", error);
        }
    };

    // Generic CRUD operations for expenses, revenues, etc.
    const createCrudOperations = <T extends { id: number | string }>(
        state: T[],
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        apiService: { add: (item: any) => Promise<T>, update: (id: any, item: any) => Promise<T>, delete: (id: any) => Promise<void> }
    ) => ({
        add: async (itemData: Omit<T, 'id'>) => {
            try {
                const newItem = await apiService.add(itemData);
                if (newItem) setState(prev => [newItem, ...prev]);
            } catch (error) { console.error(`Failed to add item:`, error); }
        },
        update: async (updatedItem: T) => {
            try {
                const { id, ...itemData } = updatedItem;
                const updated = await apiService.update(id, itemData);
                if(updated) setState(prev => prev.map(item => (item.id === updated.id ? updated : item)));
            } catch (error) { console.error(`Failed to update item:`, error); }
        },
        delete: async (itemId: number | string) => {
            try {
                await apiService.delete(itemId);
                setState(prev => prev.filter(item => item.id !== itemId));
            } catch (error) { console.error(`Failed to delete item:`, error); }
        }
    });

    const expenseOps = createCrudOperations(expenses, setExpenses, { add: api.addExpense, update: api.updateExpense, delete: api.deleteExpense });
    const revenueOps = createCrudOperations(revenues, setRevenues, { add: api.addRevenue, update: api.updateRevenue, delete: api.deleteRevenue });
    const staffOps = createCrudOperations(staff, setStaff, { add: api.addStaff, update: api.updateStaff, delete: () => Promise.resolve() }); // No delete for staff yet
    const userOps = createCrudOperations(users, setUsers, { add: api.addUser, update: api.updateUser, delete: api.deleteUser });
    
    // Non-standard CRUD
    const addCommunication = async (commData: Omit<Communication, 'id' | 'sentDate'>) => {
        try {
            const payload = { ...commData, sentDate: new Date().toISOString() };
            const newComm = await api.addCommunication(payload);
            if(newComm) setCommunications(prev => [newComm, ...prev]);
        } catch (error) { console.error("Failed to add communication:", error); }
    };
    
    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'isSent'>) => {
        try {
            const payload = { ...itemData, isSent: false };
            const newItem = await api.addAgendaItem(payload);
            if(newItem) setAgendaItems(prev => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) { console.error("Failed to add agenda item:", error); }
    };

    const updateAgendaItem = async (updatedItem: AgendaItem) => {
        try {
            const { id, ...itemData } = updatedItem;
            const updated = await api.updateAgendaItem(id, itemData);
            if(updated) setAgendaItems(prev => prev.map(item => item.id === updated.id ? updated : item));
        } catch (error) { console.error("Failed to update agenda item:", error); }
    };

    const addLeadCaptureCampaign = async (campaign: LeadCaptureCampaign) => {
        try {
            const { id, ...campaignData } = campaign;
            const newCampaign = await api.addLeadCaptureCampaign(campaignData);
            if(newCampaign) setLeadCaptureCampaigns(prev => [newCampaign, ...prev]);
        } catch (error) { console.error("Failed to add campaign:", error); }
    };

    const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id' | 'photos'>) => {
        try {
            const payload = { ...albumData, photos: [] };
            const newAlbum = await api.addPhotoAlbum(payload);
            if(newAlbum) setPhotoAlbums(prev => [newAlbum, ...prev]);
        } catch (error) { console.error("Failed to add album:", error); }
    };

    const deletePhotoAlbum = async (albumId: number) => {
        try {
            await api.deletePhotoAlbum(albumId);
            setPhotoAlbums(prev => prev.filter(album => album.id !== albumId));
        } catch (error) { console.error("Failed to delete album:", error); }
    };
    
    const updateAlbumPhotos = async (albumId: number, photos: Photo[]) => {
        try {
            const updatedAlbum = await api.updateAlbumPhotos(albumId, photos);
            if(updatedAlbum) setPhotoAlbums(prev => prev.map(a => a.id === albumId ? updatedAlbum : a));
        } catch (error) { console.error("Failed to update photos in album:", error); }
    };
    
    const addPhotoToAlbum = (albumId: number, photoData: { url: string; caption: string }) => {
        const album = photoAlbums.find(a => a.id === albumId);
        if (!album) return;
        const newPhoto: Photo = { id: Date.now(), ...photoData };
        const updatedPhotos = [...album.photos, newPhoto];
        updateAlbumPhotos(albumId, updatedPhotos);
    };

    const deletePhotoFromAlbum = (albumId: number, photoId: number) => {
        const album = photoAlbums.find(a => a.id === albumId);
        if (!album) return;
        const updatedPhotos = album.photos.filter(p => p.id !== photoId);
        updateAlbumPhotos(albumId, updatedPhotos);
    };


    const value: DataContextType = {
        students, invoices, leads, staff, users, communications, agendaItems, libraryBooks, photoAlbums,
        financialSummary, expenses, revenues, leadCaptureCampaigns, loading,
        addStudent, updateStudent, addLead, updateLead, addInvoice, updateInvoice, deleteInvoice,
        addExpense: expenseOps.add, updateExpense: expenseOps.update, deleteExpense: expenseOps.delete,
        addRevenue: revenueOps.add, updateRevenue: revenueOps.update, deleteRevenue: revenueOps.delete,
        addStaff: staffOps.add, updateStaff: staffOps.update,
        addCommunication, addAgendaItem, updateAgendaItem,
        addUser: userOps.add, updateUser: userOps.update, deleteUser: userOps.delete,
        addLeadCaptureCampaign, addPhotoAlbum, deletePhotoAlbum, addPhotoToAlbum, deletePhotoFromAlbum
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
