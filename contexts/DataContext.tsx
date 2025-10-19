import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, 
    FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign, Photo, DataContextType, 
    RevenueCategory, StudentStatus, PaymentStatus, UserStatus, StudentColumns, LeadColumns, InvoiceColumns, PhotoAlbumColumns
} from '../types';
import * as api from '../services/apiService';
import { useAuth } from './AuthContext'; // We'll need this to get the school_id
import { supabase } from '../services/supabaseClient';

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

    const addStudent = async (studentData: Omit<Student, 'id' | 'school_id' | 'status' | 'enrollmentDate' | 'avatarUrl' | 'grades' | 'attendance' | 'occurrences' | 'documents' | 'individualAgenda' | 'communicationLog' | 'tuition_plan_id' | 'medicalNotes'>) => {
        if (!currentUser?.school_id) return;
        try {
            const newStudentPayload: StudentColumns = {
                ...studentData,
                school_id: currentUser.school_id,
                status: StudentStatus.Active,
                enrollmentDate: new Date().toISOString().split('T')[0],
                avatarUrl: `https://picsum.photos/seed/student${Date.now()}/100/100`,
                tuition_plan_id: 1, 
                medicalNotes: ''
            };
            const newStudentFromDb = await api.addStudent(newStudentPayload);
            // Rehydrate the object with empty arrays for local state consistency
            const newStudentForState: Student = {
                ...newStudentFromDb,
                grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: []
            }
            setStudents(prev => [newStudentForState, ...prev]);
        } catch (error) {
            console.error('Falha ao adicionar aluno:', error);
            alert(`Erro ao salvar aluno: ${(error as Error).message}`);
        }
    };

    const updateStudent = async (updatedStudent: Student) => {
        try {
            const { id, school_id, grades, attendance, occurrences, documents, individualAgenda, communicationLog, ...studentColumns } = updatedStudent;
            const updatedFromDb = await api.updateStudent(id, studentColumns);
            // Re-attach the relational arrays to the updated object for local state consistency
            const rehydratedStudent: Student = {
                ...updatedFromDb,
                grades, attendance, occurrences, documents, individualAgenda, communicationLog
            };
            setStudents(prev => prev.map(s => (s.id === id ? rehydratedStudent : s)));
        } catch (error) {
            console.error('Falha ao atualizar aluno:', error);
            alert(`Erro ao atualizar aluno: ${(error as Error).message}`);
        }
    };
    
    const addLead = async (leadData: Omit<Lead, 'id' | 'school_id'>, campaignId?: string) => {
        let schoolIdToAdd: string | undefined = currentUser?.school_id;

        // Lógica para formulários públicos de captura de leads, onde não há currentUser.
        if (!schoolIdToAdd && campaignId) {
            try {
                // Busca o school_id da campanha. A RLS para a tabela lead_capture_campaigns
                // deve permitir a leitura pública das colunas 'id' e 'school_id'.
                const { data: campaign, error } = await supabase
                    .from('lead_capture_campaigns')
                    .select('school_id')
                    .eq('id', campaignId)
                    .single();
                
                if (error) throw error;
                if (campaign) {
                    schoolIdToAdd = campaign.school_id;
                } else {
                     throw new Error('Campanha de captura de lead não encontrada.');
                }
            } catch (error) {
                 console.error("Falha ao buscar dados da campanha pública:", error);
                 alert(`Erro ao submeter formulário: ${(error as Error).message}`);
                 return; // Para a execução
            }
        }
        
        if (!schoolIdToAdd) {
            alert('Erro: Não foi possível identificar a escola. O envio falhou.');
            return;
        }

        try {
            const newLeadPayload: LeadColumns = {
                school_id: schoolIdToAdd,
                ...leadData,
            };
            const newLeadFromDb = await api.addLead(newLeadPayload);
            // Rehidrata para o estado local
            const newLeadForState: Lead = {
                ...newLeadFromDb,
                tasks: leadData.tasks || [],
                requiredDocuments: leadData.requiredDocuments || [],
                communicationLog: leadData.communicationLog || []
            };
            setLeads(prev => [newLeadForState, ...prev]);
            
            // Atualiza a contagem de leads da campanha (só funcionará para usuários logados, o que é aceitável)
            if (campaignId) {
                setLeadCaptureCampaigns(prev => prev.map(c => 
                    c.id === campaignId ? { ...c, leadsCaptured: c.leadsCaptured + 1 } : c
                ));
            }
        } catch(error) {
            console.error("Falha ao adicionar lead:", error);
            alert(`Erro ao salvar lead: ${(error as Error).message}`);
        }
    };
    
    const updateLead = async (updatedLead: Lead) => {
        try {
             const { id, school_id, tasks, requiredDocuments, communicationLog, ...leadColumns } = updatedLead;
            const updatedFromDb = await api.updateLead(id, leadColumns);
            const rehydratedLead: Lead = {
                ...updatedFromDb,
                tasks, requiredDocuments, communicationLog
            };
            setLeads(prev => prev.map(l => (l.id === id ? rehydratedLead : l)));
        } catch(error) {
            console.error("Falha ao atualizar lead:", error);
            alert(`Erro ao atualizar lead: ${(error as Error).message}`);
        }
    };

    const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'school_id' | 'status' | 'payments' | 'studentName'> & { studentId: number }) => {
        if (!currentUser?.school_id) return;
        try {
            const student = students.find(s => s.id === newInvoiceData.studentId);
            if (!student) throw new Error("Student not found");

            const id = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-5)}`;
            
            const payload: InvoiceColumns = {
                id,
                ...newInvoiceData,
                studentName: student.name,
                status: new Date(newInvoiceData.dueDate) < new Date() ? PaymentStatus.Overdue : PaymentStatus.Pending,
            };
            const newInvoiceFromDb = await api.addInvoice(payload);
            const newInvoiceForState: Invoice = { ...newInvoiceFromDb, school_id: currentUser.school_id, payments: [] };
            setInvoices(prev => [newInvoiceForState, ...prev]);
        } catch(error) {
            console.error("Falha ao adicionar fatura:", error);
            alert(`Erro ao salvar fatura: ${(error as Error).message}`);
        }
    };

    const updateInvoice = async (updatedInvoice: Invoice) => {
        try {
            const { id, school_id, studentId, studentName, payments, ...invoiceColumns } = updatedInvoice;
            const updatedFromDb = await api.updateInvoice(id, invoiceColumns);
            const rehydratedInvoice: Invoice = { ...updatedFromDb, school_id, studentId, studentName, payments };
            setInvoices(prev => prev.map(inv => (inv.id === id ? rehydratedInvoice : inv)));
        } catch(error) {
            console.error("Falha ao atualizar fatura:", error);
            alert(`Erro ao atualizar fatura: ${(error as Error).message}`);
        }
    };

    const deleteInvoice = async (invoiceId: string) => {
        try {
            await api.deleteInvoice(invoiceId);
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        } catch(error) {
            console.error("Falha ao excluir fatura:", error);
            alert(`Erro ao excluir fatura: ${(error as Error).message}`);
        }
    };

    const createCrudOperations = <T extends { id: number | string }>(
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        apiService: { add: (item: any) => Promise<T>, update: (id: any, item: any) => Promise<T>, delete: (id: any) => Promise<void> },
        itemName: string
    ) => ({
        add: async (itemData: Omit<T, 'id' | 'school_id'>) => {
            if (!currentUser?.school_id) return;
            try {
                const newPayload = { school_id: currentUser.school_id, ...itemData };
                const newItem = await apiService.add(newPayload);
                if (newItem) setState(prev => [newItem, ...prev]);
            } catch (error) { 
                console.error(`Falha ao adicionar ${itemName}:`, error);
                alert(`Erro ao salvar ${itemName}: ${(error as Error).message}`);
            }
        },
        update: async (updatedItem: T) => {
            try {
                const { id, ...itemData } = updatedItem as T & { school_id?: string };
                delete (itemData as Partial<T & { school_id?: string }>).school_id;
                const updated = await apiService.update(id, itemData);
                if(updated) setState(prev => prev.map(item => (item.id === updated.id ? updated : item)));
            } catch (error) { 
                console.error(`Falha ao atualizar ${itemName}:`, error);
                alert(`Erro ao atualizar ${itemName}: ${(error as Error).message}`);
            }
        },
        delete: async (itemId: number | string) => {
            try {
                await apiService.delete(itemId);
                setState(prev => prev.filter(item => item.id !== itemId));
            } catch (error) { 
                console.error(`Falha ao excluir ${itemName}:`, error);
                alert(`Erro ao excluir ${itemName}: ${(error as Error).message}`);
            }
        }
    });
    
    const expenseOps = createCrudOperations(setExpenses, { add: api.addExpense, update: api.updateExpense, delete: api.deleteExpense }, "despesa");
    const revenueOps = createCrudOperations(setRevenues, { add: api.addRevenue, update: api.updateRevenue, delete: api.deleteRevenue }, "receita");
    const staffOps = createCrudOperations(setStaff, { add: api.addStaff, update: api.updateStaff, delete: () => Promise.resolve() }, "funcionário");
    
    const addUser = async (userData: Omit<User, 'id' | 'school_id' | 'avatarUrl' | 'status'> & { password?: string }) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = {
                school_id: currentUser.school_id, 
                ...userData, 
                status: UserStatus.Active,
                avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`
            };
            const newUser = await api.addUser(payload);
            setUsers(prev => [newUser, ...prev]);
        } catch (error) { 
            console.error("Falha ao adicionar usuário:", error);
            alert(`Erro ao salvar usuário: ${(error as Error).message}`);
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            const { id, school_id, ...userData } = updatedUser;
            const updated = await api.updateUser(id, userData);
            setUsers(prev => prev.map(u => u.id === id ? updated : u));
        } catch(e) { 
            console.error("Falha ao atualizar usuário", e);
            alert(`Erro ao atualizar usuário: ${(e as Error).message}`);
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch(e) { 
            console.error("Falha ao excluir usuário", e);
            alert(`Erro ao excluir usuário: ${(e as Error).message}`);
        }
    }

    // Non-standard CRUD
    const addCommunication = async (commData: Omit<Communication, 'id' | 'school_id' | 'sentDate'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...commData, sentDate: new Date().toISOString() };
            const newComm = await api.addCommunication(payload);
            setCommunications(prev => [newComm, ...prev]);
        } catch (error) { 
            console.error("Falha ao adicionar comunicação:", error);
            alert(`Erro ao enviar comunicação: ${(error as Error).message}`);
        }
    };
    
    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'school_id' | 'isSent'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...itemData, isSent: false };
            const newItem = await api.addAgendaItem(payload);
            setAgendaItems(prev => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) { 
            console.error("Falha ao adicionar item na agenda:", error);
            alert(`Erro ao salvar item na agenda: ${(error as Error).message}`);
        }
    };

    const updateAgendaItem = async (updatedItem: AgendaItem) => {
        try {
            const { id, school_id, ...itemData } = updatedItem;
            const updated = await api.updateAgendaItem(id, itemData);
            setAgendaItems(prev => prev.map(item => item.id === updated.id ? updated : item));
        } catch (error) { 
            console.error("Falha ao atualizar item na agenda:", error);
            alert(`Erro ao atualizar item na agenda: ${(error as Error).message}`);
        }
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
            setLeadCaptureCampaigns(prev => [newCampaign, ...prev]);
        } catch (error) { 
            console.error("Falha ao adicionar campanha:", error);
            alert(`Erro ao criar campanha: ${(error as Error).message}`);
        }
    };

    const addPhotoAlbum = async (albumData: Omit<PhotoAlbum, 'id' | 'school_id' | 'photos'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload: PhotoAlbumColumns = { school_id: currentUser.school_id, ...albumData };
            const newAlbumFromDb = await api.addPhotoAlbum(payload);
            const newAlbumForState: PhotoAlbum = { ...newAlbumFromDb, photos: [] };
            setPhotoAlbums(prev => [newAlbumForState, ...prev]);
        } catch (error) { 
            console.error("Falha ao adicionar álbum:", error);
            alert(`Erro ao criar álbum: ${(error as Error).message}`);
        }
    };

    const deletePhotoAlbum = async (albumId: number) => {
        try {
            await api.deletePhotoAlbum(albumId);
            setPhotoAlbums(prev => prev.filter(album => album.id !== albumId));
        } catch (error) { 
            console.error("Falha ao excluir álbum:", error);
            alert(`Erro ao excluir álbum: ${(error as Error).message}`);
        }
    };
    
    const updateAlbumPhotos = async (albumId: number, photos: Photo[]) => {
        try {
            const updatedAlbum = await api.updateAlbumPhotos(albumId, photos);
            setPhotoAlbums(prev => prev.map(a => a.id === albumId ? updatedAlbum : a));
        } catch (error) { 
            console.error("Falha ao atualizar fotos no álbum:", error);
            alert(`Erro ao salvar fotos: ${(error as Error).message}`);
        }
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