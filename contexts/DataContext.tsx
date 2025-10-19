import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign, LeadStatus, StudentStatus, PaymentStatus, StaffStatus, UserStatus, Photo, DataContextType, RevenueCategory } from '../types';
import * as api from '../services/apiService';
import { useAuth } from './AuthContext'; // We'll need this to get the school_id

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to generate a somewhat unique numeric ID for non-DB-backed items
const generateNumericId = () => Date.now() + Math.floor(Math.random() * 1000);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth(); // Get the currently logged-in user
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
        // Only load data if we have a logged-in user with a school_id
        if (!currentUser?.school_id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // With RLS, these calls will automatically be scoped to the user's school
            const [
                studentsData, invoicesData, leadsData, staffData, usersData,
                communicationsData, agendaData, libraryData, albumData,
                expensesData, revenuesData, campaignsData,
            ] = await Promise.all([
                api.getStudents(), api.getInvoices(), api.getLeads(), api.getStaff(), api.getUsers(),
                api.getCommunications(), api.getAgendaItems(), api.getLibraryBooks(), api.getPhotoAlbums(),
                api.getExpenses(), api.getRevenues(), api.getLeadCaptureCampaigns(),
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
            setExpenses(expensesData);
            setRevenues(revenuesData);
            setLeadCaptureCampaigns(campaignsData);
            
            // Calculate Financial Summary Dynamically
            const summaryByMonth: { [key: string]: FinancialSummaryPoint & { year: number, monthIndex: number } } = {};
            const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

            [...revenuesData, ...expensesData].forEach(transaction => {
                const date = new Date(transaction.date);
                const year = date.getUTCFullYear();
                const monthIndex = date.getUTCMonth();
                const key = `${year}-${monthIndex}`;
                
                if (!summaryByMonth[key]) {
                    const monthName = monthFormatter.format(date).replace('.', '');
                    summaryByMonth[key] = { 
                        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        year,
                        monthIndex,
                        revenue: 0, 
                        expenses: 0 
                    };
                }
                if ('category' in transaction && Object.values(RevenueCategory).includes(transaction.category as any)) {
                     summaryByMonth[key].revenue += transaction.amount;
                } else {
                     summaryByMonth[key].expenses += transaction.amount;
                }
            });

            const finalSummary = Object.values(summaryByMonth)
                .sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex))
                .slice(-6);

            setFinancialSummary(finalSummary);

        } catch (error) {
            console.error("Failed to load data from Supabase", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]); // Re-run loadData when the user changes

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addStudent = async (studentData: Omit<Student, 'id' | 'school_id' | 'status' | 'enrollmentDate' | 'avatarUrl' | 'grades' | 'attendance' | 'occurrences' | 'documents' | 'individualAgenda' | 'communicationLog' | 'tuitionPlanId' | 'medicalNotes'>) => {
        if (!currentUser?.school_id) return;
        try {
            const newStudentPayload = {
                school_id: currentUser.school_id,
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
            const { id, school_id, ...studentData } = updatedStudent;
            const updated = await api.updateStudent(id, studentData);
            if (updated) {
                setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
            }
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    };
    
    const addLead = async (leadData: Omit<Lead, 'id' | 'school_id'>, campaignId?: string) => {
        if (!currentUser?.school_id) return;
        try {
            const newLeadPayload = {
                school_id: currentUser.school_id,
                ...leadData,
            };
            const newLead = await api.addLead(newLeadPayload);
            if (newLead) {
                setLeads(prev => [newLead, ...prev]);
                if (campaignId) {
                    // This update also needs to be scoped by RLS, which is fine
                    setLeadCaptureCampaigns(prev => prev.map(c => 
                        c.id === campaignId ? { ...c, leadsCaptured: c.leadsCaptured + 1 } : c
                    ));
                }
            }
        } catch(error) {
            console.error("Failed to add lead:", error);
        }
    };
    
    const updateLead = async (updatedLead: Lead) => {
        try {
             const { id, school_id, ...leadData } = updatedLead;
            const updated = await api.updateLead(id, leadData);
            if (updated) {
                setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
            }
        } catch(error) {
            console.error("Failed to update lead:", error);
        }
    };

    const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'school_id' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => {
        if (!currentUser?.school_id) return;
        try {
            const student = students.find(s => s.id === newInvoiceData.studentId);
            if (!student) throw new Error("Student not found");

            const id = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-5)}`;
            const payload: Omit<Invoice, 'school_id'> = {
                id,
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
            const { id, school_id, ...invoiceData } = updatedInvoice;
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

    const createCrudOperations = <T extends { id: number | string }>(
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        apiService: { add: (item: any) => Promise<T>, update: (id: any, item: any) => Promise<T>, delete: (id: any) => Promise<void> }
    ) => ({
        add: async (itemData: Omit<T, 'id' | 'school_id'>) => {
            if (!currentUser?.school_id) return;
            try {
                const newPayload = { school_id: currentUser.school_id, ...itemData };
                const newItem = await apiService.add(newPayload);
                if (newItem) setState(prev => [newItem, ...prev]);
            } catch (error) { console.error(`Failed to add item:`, error); }
        },
        update: async (updatedItem: T) => {
            try {
                const { id, ...itemData } = updatedItem as T & { school_id?: string };
                delete (itemData as Partial<T & { school_id?: string }>).school_id;
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
    
    const expenseOps = createCrudOperations(setExpenses, { add: api.addExpense, update: api.updateExpense, delete: api.deleteExpense });
    const revenueOps = createCrudOperations(setRevenues, { add: api.addRevenue, update: api.updateRevenue, delete: api.deleteRevenue });
    const staffOps = createCrudOperations(setStaff, { add: api.addStaff, update: api.updateStaff, delete: () => Promise.resolve() });
    
    const addUser = async (userData: Omit<User, 'id' | 'school_id' | 'avatarUrl' | 'status'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = {
                school_id: currentUser.school_id, 
                ...userData, 
                status: UserStatus.Active,
                avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`
            };
            const newUser = await api.addUser(payload);
            if (newUser) {
                setUsers(prev => [newUser, ...prev]);
            }
        } catch (error) { console.error("Failed to add user:", error); }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            const { id, school_id, ...userData } = updatedUser;
            const updated = await api.updateUser(id, userData);
            if (updated) setUsers(prev => prev.map(u => u.id === id ? updated : u));
        } catch(e) { console.error("Failed to update user", e); }
    };

    const deleteUser = async (userId: string) => {
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch(e) { console.error("Failed to delete user", e); }
    }

    // Non-standard CRUD
    const addCommunication = async (commData: Omit<Communication, 'id' | 'school_id' | 'sentDate'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...commData, sentDate: new Date().toISOString() };
            const newComm = await api.addCommunication(payload);
            if(newComm) setCommunications(prev => [newComm, ...prev]);
        } catch (error) { console.error("Failed to add communication:", error); }
    };
    
    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'school_id' | 'isSent'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...itemData, isSent: false };
            const newItem = await api.addAgendaItem(payload);
            if(newItem) setAgendaItems(prev => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) { console.error("Failed to add agenda item:", error); }
    };

    const updateAgendaItem = async (updatedItem: AgendaItem) => {
        try {
            const { id, school_id, ...itemData } = updatedItem;
            const updated = await api.updateAgendaItem(id, itemData);
            if(updated) setAgendaItems(prev => prev.map(item => item.id === updated.id ? updated : item));
        } catch (error) { console.error("Failed to update agenda item:", error); }
    };

    const addLeadCaptureCampaign = async (campaignData: Omit<LeadCaptureCampaign, 'id' | 'school_id' | 'publicUrl' | 'createdAt' | 'leadsCaptured'>) => {
        if (!currentUser?.school_id) return;
        try {
            const campaignId = `campaign-${Date.now()}`;
            const payload = {
                id: campaignId,
                school_id: currentUser.school_id,
                ...campaignData,
                publicUrl: `/#/capture/${campaignId}`,
                createdAt: new Date().toISOString(),
                leadsCaptured: 0,
            };
            const newCampaign = await api.addLeadCaptureCampaign(payload);
            if(newCampaign) setLeadCaptureCampaigns(prev => [newCampaign, ...prev]);
        } catch (error) { console.error("Failed to add campaign:", error); }
    };

    const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id' | 'school_id' | 'photos'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...albumData, photos: [] };
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
        const newPhoto: Photo = { id: generateNumericId(), ...photoData };
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
        addUser, updateUser, deleteUser,
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