import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, 
    FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign, Photo, DataContextType, 
    RevenueCategory, StudentStatus, PaymentStatus, UserStatus, StudentColumns, LeadColumns, InvoiceColumns, PhotoAlbumColumns, StaffStatus, TuitionPlan
} from '../types';
import * as api from '../services/apiService';
import { useAuth } from './AuthContext'; // We'll need this to get the schoolId
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
    const [tuitionPlans, setTuitionPlans] = useState<TuitionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        // Only load data if we have a logged-in user with a schoolId
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
                expensesData, revenuesData, campaignsData, tuitionPlansData,
            ] = await Promise.all([
                api.getStudents(), api.getInvoices(), api.getLeads(), api.getStaff(), api.getUsers(),
                api.getCommunications(), api.getAgendaItems(), api.getLibraryBooks(), api.getPhotoAlbums(),
                api.getExpenses(), api.getRevenues(), api.getLeadCaptureCampaigns(), api.getTuitionPlans(),
            ]);
            
            setStudents(studentsData);
            setInvoices(invoicesData);
            setLeads(leadsData);
            setStaff(staffData);
            setUsers(usersData);
            setCommunications(communicationsData);
            setAgendaItems(agendaData);
            setLibraryBooks(libraryData);
            
            // FIX: Sanitize album data to ensure the 'photos' property is always an array.
            // This prevents crashes when components access properties like '.length' on a null value.
            const sanitizedAlbums = albumData.map(album => ({
                ...album,
                photos: album.photos || [],
            }));
            setPhotoAlbums(sanitizedAlbums);

            setExpenses(expensesData);
            setRevenues(revenuesData);
            setLeadCaptureCampaigns(campaignsData);
            setTuitionPlans(tuitionPlansData);
            
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

    const addStudent = async (studentData: Pick<Student, 'name' | 'class' | 'parent_name' | 'parent_contact' | 'cpf' | 'address' | 'email' | 'phone' | 'tuition_plan_id'>) => {
        if (!currentUser?.school_id) return;
        try {
            const newStudentPayload = {
                school_id: currentUser.school_id,
                name: studentData.name,
                class: studentData.class,
                parent_name: studentData.parent_name,
                parent_contact: studentData.parent_contact,
                cpf: studentData.cpf,
                address: studentData.address,
                email: studentData.email,
                phone: studentData.phone,
                tuition_plan_id: studentData.tuition_plan_id,
                status: StudentStatus.Active,
                enrollment_date: new Date().toISOString().split('T')[0],
                avatar_url: `https://picsum.photos/seed/student${Date.now()}/100/100`,
                medical_notes: ''
            };
            const newStudentFromDb = await api.addStudent(newStudentPayload);
            // Rehydrate the object with empty arrays for local state consistency
            const newStudentForState: Student = {
                ...newStudentFromDb,
                grades: [], attendance: [], occurrences: [], documents: [], individual_agenda: [], communication_log: []
            }
            setStudents(prev => [newStudentForState, ...prev]);
        } catch (error) {
            console.error('Falha ao adicionar aluno:', error);
            alert(`Erro ao salvar aluno: ${(error as Error).message}`);
        }
    };

    const updateStudent = async (updatedStudent: Student) => {
        try {
            const { id, school_id, grades, attendance, occurrences, documents, individual_agenda, communication_log, ...rest } = updatedStudent;
             const studentUpdatePayload = {
                name: rest.name,
                class: rest.class,
                enrollment_date: rest.enrollment_date,
                status: rest.status,
                parent_name: rest.parent_name,
                parent_contact: rest.parent_contact,
                avatar_url: rest.avatar_url,
                cpf: rest.cpf,
                address: rest.address,
                email: rest.email,
                phone: rest.phone,
                medical_notes: rest.medical_notes,
                tuition_plan_id: rest.tuition_plan_id,
                // Include JSONB fields in the update payload
                grades,
                attendance,
                occurrences,
                documents,
                individual_agenda,
                communication_log,
            };
            const updatedFromDb = await api.updateStudent(id, studentUpdatePayload);
            setStudents(prev => prev.map(s => (s.id === id ? updatedFromDb : s)));
        } catch (error) {
            console.error('Falha ao atualizar aluno:', error);
            alert(`Erro ao atualizar aluno: ${(error as Error).message}`);
        }
    };

    const deleteStudent = async (studentId: number) => {
        try {
            await api.deleteStudent(studentId);
            setStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (error) {
            console.error('Falha ao excluir aluno:', error);
            alert(`Erro ao excluir aluno: ${(error as Error).message}`);
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
            // FIX: Removed JSONB fields ('tasks', 'required_documents', 'communication_log') from the payload.
            // These fields are not part of the 'LeadColumns' type used for inserts and are added to the local state after the record is created.
            const newLeadPayload: LeadColumns = {
                school_id: schoolIdToAdd,
                name: leadData.name,
                parent_name: leadData.parent_name,
                contact: leadData.contact,
                status: leadData.status,
                interest_date: leadData.interest_date,
                notes: leadData.notes,
                is_converted: leadData.is_converted,
            };
            const newLeadFromDb = await api.addLead(newLeadPayload);
            // Rehidrata para o estado local
            const newLeadForState: Lead = {
                ...newLeadFromDb,
                tasks: leadData.tasks || [],
                required_documents: leadData.required_documents || [],
                communication_log: leadData.communication_log || []
            };
            setLeads(prev => [newLeadForState, ...prev]);
            
            // Atualiza a contagem de leads da campanha (só funcionará para usuários logados, o que é aceitável)
            if (campaignId) {
                setLeadCaptureCampaigns(prev => prev.map(c => 
                    c.id === campaignId ? { ...c, leads_captured: c.leads_captured + 1 } : c
                ));
            }
        } catch(error) {
            console.error("Falha ao adicionar lead:", error);
            alert(`Erro ao salvar lead: ${(error as Error).message}`);
        }
    };
    
    const updateLead = async (updatedLead: Lead) => {
        try {
            const { id, school_id, ...rest } = updatedLead;
            const leadUpdatePayload = {
                name: rest.name,
                parent_name: rest.parent_name,
                contact: rest.contact,
                status: rest.status,
                interest_date: rest.interest_date,
                notes: rest.notes,
                tasks: rest.tasks,
                is_converted: rest.is_converted,
                required_documents: rest.required_documents,
                communication_log: rest.communication_log,
            };
            const updatedFromDb = await api.updateLead(id, leadUpdatePayload);
            setLeads(prev => prev.map(l => (l.id === id ? updatedFromDb : l)));
        } catch(error) {
            console.error("Falha ao atualizar lead:", error);
            alert(`Erro ao atualizar lead: ${(error as Error).message}`);
        }
    };

    const deleteLead = async (leadId: number) => {
        try {
            await api.deleteLead(leadId);
            setLeads(prev => prev.filter(l => l.id !== leadId));
        } catch (error) {
            console.error('Falha ao excluir lead:', error);
            alert(`Erro ao excluir lead: ${(error as Error).message}`);
        }
    };

    const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'school_id' | 'status' | 'payments' | 'student_name'> & { student_id: number }) => {
        if (!currentUser?.school_id) return;
        try {
            const student = students.find(s => s.id === newInvoiceData.student_id);
            if (!student) throw new Error("Student not found");

            const id = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-5)}`;
            
            const payload: InvoiceColumns = {
                id,
                school_id: currentUser.school_id,
                student_id: newInvoiceData.student_id,
                amount: newInvoiceData.amount,
                due_date: newInvoiceData.due_date,
                student_name: student.name,
                status: new Date(newInvoiceData.due_date) < new Date() ? PaymentStatus.Overdue : PaymentStatus.Pending,
            };
            const newInvoiceFromDb = await api.addInvoice(payload);
            const newInvoiceForState: Invoice = { ...newInvoiceFromDb, payments: [] };
            setInvoices(prev => [newInvoiceForState, ...prev]);
        } catch(error) {
            console.error("Falha ao adicionar fatura:", error);
            alert(`Erro ao salvar fatura: ${(error as Error).message}`);
        }
    };

    const updateInvoice = async (updatedInvoice: Invoice) => {
        try {
            const { id, school_id, student_id, student_name, ...rest } = updatedInvoice;
            const invoiceUpdatePayload = {
                amount: rest.amount,
                due_date: rest.due_date,
                paid_date: rest.paid_date,
                status: rest.status,
                payments: rest.payments,
            };
            const updatedFromDb = await api.updateInvoice(id, invoiceUpdatePayload);
            const rehydratedInvoice: Invoice = { ...updatedFromDb, school_id, student_id, student_name };
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
    const tuitionPlanOps = createCrudOperations(setTuitionPlans, { add: api.addTuitionPlan, update: api.updateTuitionPlan, delete: api.deleteTuitionPlan }, "plano de mensalidade");

    const addStaff = async (staffData: Pick<Staff, 'name' | 'role' | 'email' | 'phone' | 'cpf' | 'address'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload: Omit<Staff, 'id'> = {
                name: staffData.name,
                role: staffData.role,
                email: staffData.email,
                phone: staffData.phone,
                cpf: staffData.cpf,
                address: staffData.address,
                school_id: currentUser.school_id,
                status: StaffStatus.Active,
                hire_date: new Date().toISOString().split('T')[0],
                avatar_url: `https://picsum.photos/seed/staff${Date.now()}/100/100`,
            };
            const newStaff = await api.addStaff(payload);
            setStaff(prev => [newStaff, ...prev]);
        } catch (error) {
            console.error('Falha ao adicionar funcionário:', error);
            alert(`Erro ao salvar funcionário: ${(error as Error).message}`);
        }
    };
    
    const updateStaff = async (updatedStaff: Staff) => {
        try {
            const { id, school_id, ...rest } = updatedStaff;
            const staffUpdatePayload = {
                name: rest.name,
                role: rest.role,
                email: rest.email,
                phone: rest.phone,
                hire_date: rest.hire_date,
                status: rest.status,
                avatar_url: rest.avatar_url,
                cpf: rest.cpf,
                address: rest.address,
            };
            const updated = await api.updateStaff(id, staffUpdatePayload);
            setStaff(prev => prev.map(s => (s.id === id ? updated : s)));
        } catch (error) {
            console.error('Falha ao atualizar funcionário:', error);
            alert(`Erro ao atualizar funcionário: ${(error as Error).message}`);
        }
    };
    
    const deleteStaff = async (staffId: number) => {
        try {
            await api.deleteStaff(staffId);
            setStaff(prev => prev.filter(s => s.id !== staffId));
        } catch (error) {
            console.error('Falha ao excluir funcionário:', error);
            alert(`Erro ao excluir funcionário: ${(error as Error).message}`);
        }
    };

    const addUser = async (userData: Omit<User, 'id' | 'school_id' | 'avatar_url' | 'status'> & { password?: string }) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = {
                school_id: currentUser.school_id, 
                ...userData, 
                status: UserStatus.Active,
                avatar_url: `https://picsum.photos/seed/user${Date.now()}/100/100`
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

    const addCommunication = async (commData: Omit<Communication, 'id' | 'school_id' | 'sent_date'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...commData, sent_date: new Date().toISOString() };
            const newComm = await api.addCommunication(payload);
            setCommunications(prev => [newComm, ...prev]);
        } catch (error) { 
            console.error("Falha ao adicionar comunicação:", error);
            alert(`Erro ao enviar comunicação: ${(error as Error).message}`);
        }
    };

    const updateCommunication = async (updatedComm: Communication) => {
        try {
            const { id, school_id, ...commData } = updatedComm;
            const updated = await api.updateCommunication(id, commData);
            setCommunications(prev => prev.map(c => (c.id === id ? updated : c)));
        } catch (error) {
            console.error("Falha ao atualizar comunicação:", error);
            alert(`Erro ao atualizar comunicação: ${(error as Error).message}`);
        }
    };
    
    const deleteCommunication = async (commId: number) => {
        try {
            await api.deleteCommunication(commId);
            setCommunications(prev => prev.filter(c => c.id !== commId));
        } catch (error) {
            console.error("Falha ao excluir comunicação:", error);
            alert(`Erro ao excluir comunicação: ${(error as Error).message}`);
        }
    };
    
    const addAgendaItem = async (itemData: Omit<AgendaItem, 'id' | 'school_id' | 'is_sent'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = { school_id: currentUser.school_id, ...itemData, is_sent: false };
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

    const deleteAgendaItem = async (itemId: number) => {
        try {
            await api.deleteAgendaItem(itemId);
            setAgendaItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Falha ao excluir item da agenda:", error);
            alert(`Erro ao excluir item da agenda: ${(error as Error).message}`);
        }
    };

    const addLeadCaptureCampaign = async (campaignData: Omit<LeadCaptureCampaign, 'id' | 'school_id' | 'public_url' | 'created_at' | 'leads_captured'>) => {
        if (!currentUser?.school_id) return;
        try {
            const campaignId = `campaign-${Date.now()}`;
            const payload = {
                id: campaignId,
                school_id: currentUser.school_id,
                ...campaignData,
                public_url: `/#/capture/${campaignId}`,
                created_at: new Date().toISOString(),
                leads_captured: 0,
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

    const updatePhotoAlbum = async (updatedAlbum: Omit<PhotoAlbum, 'school_id' | 'photos'>) => {
        try {
            const { id, ...albumData } = updatedAlbum;
            const updatedFromApi = await api.updatePhotoAlbum(id, albumData);
            setPhotoAlbums(prev => prev.map(a => {
                if (a.id === id) {
                    // FIX: Preserve the existing photos array from the state.
                    // The API response for an album metadata update might contain 'photos: null',
                    // which would overwrite the local array and cause crashes.
                    return { ...a, ...updatedFromApi, photos: a.photos };
                }
                return a;
            }));
        } catch (error) {
            console.error("Falha ao atualizar álbum:", error);
            alert(`Erro ao atualizar álbum: ${(error as Error).message}`);
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
            // Persist the change to the database. We don't need to trust the return value
            // if we update the local state manually.
            await api.updateAlbumPhotos(albumId, photos);

            // Manually update the local state to ensure consistency.
            setPhotoAlbums(prevAlbums =>
                prevAlbums.map(album =>
                    album.id === albumId
                        ? { ...album, photos: photos } // Create a new album object with the updated photos
                        : album
                )
            );
        } catch (error) { 
            console.error("Falha ao atualizar fotos no álbum:", error);
            alert(`Erro ao salvar fotos: ${(error as Error).message}`);
        }
    };
    
    const addPhotoToAlbum = async (albumId: number, photoData: { url: string; caption: string }) => {
        const album = photoAlbums.find(a => a.id === albumId);
        if (!album) return;
        const newPhoto: Photo = { id: generateNumericId(), ...photoData };
        const updatedPhotos = [...album.photos, newPhoto];
        await updateAlbumPhotos(albumId, updatedPhotos);
    };

    const addPhotosToAlbum = async (albumId: number, photoDataArray: { url: string; caption: string }[]) => {
        const album = photoAlbums.find(a => a.id === albumId);
        if (!album) return;
        const newPhotos: Photo[] = photoDataArray.map(pd => ({
            id: generateNumericId(),
            ...pd,
        }));
        const updatedPhotos = [...album.photos, ...newPhotos];
        await updateAlbumPhotos(albumId, updatedPhotos);
    };

    const deletePhotoFromAlbum = async (albumId: number, photoId: number) => {
        const album = photoAlbums.find(a => a.id === albumId);
        if (!album) return;
        const updatedPhotos = album.photos.filter(p => p.id !== photoId);
        await updateAlbumPhotos(albumId, updatedPhotos);
    };
    
    const addLibraryBook = async (bookData: Omit<LibraryBook, 'id' | 'school_id'>) => {
        if (!currentUser?.school_id) return;
        try {
            const payload = {
                school_id: currentUser.school_id,
                title: bookData.title,
                author: bookData.author,
                isbn: bookData.isbn,
                status: bookData.status,
                borrowed_by: bookData.borrowed_by,
                due_date: bookData.due_date,
            };
            const newItem = await api.addLibraryBook(payload as Omit<LibraryBook, 'id'>);
            if (newItem) setLibraryBooks(prev => [newItem, ...prev]);
        } catch (error) {
            console.error("Falha ao adicionar livro:", error);
            alert(`Erro ao salvar livro: ${(error as Error).message}`);
        }
    };

    const updateLibraryBook = async (updatedBook: LibraryBook) => {
        try {
            const { id, school_id, ...rest } = updatedBook;
            const payload = {
                title: rest.title,
                author: rest.author,
                isbn: rest.isbn,
                status: rest.status,
                borrowed_by: rest.borrowed_by,
                due_date: rest.due_date,
            };
            const updated = await api.updateLibraryBook(id, payload);
            if (updated) setLibraryBooks(prev => prev.map(item => (item.id === updated.id ? updated : item)));
        } catch (error) {
            console.error("Falha ao atualizar livro:", error);
            alert(`Erro ao atualizar livro: ${(error as Error).message}`);
        }
    };
    
    const deleteLibraryBook = async (bookId: number) => {
        try {
            await api.deleteLibraryBook(bookId);
            setLibraryBooks(prev => prev.filter(item => item.id !== bookId));
        } catch (error) {
            console.error("Falha ao excluir livro:", error);
            alert(`Erro ao excluir livro: ${(error as Error).message}`);
        }
    };


    const value: DataContextType = {
        students, invoices, leads, staff, users, communications, agendaItems, libraryBooks, photoAlbums,
        financialSummary, expenses, revenues, leadCaptureCampaigns, tuitionPlans, loading,
        addStudent, updateStudent, deleteStudent, 
        addLead, updateLead, deleteLead,
        addInvoice, updateInvoice, deleteInvoice,
        addExpense: expenseOps.add, updateExpense: expenseOps.update, deleteExpense: expenseOps.delete,
        addRevenue: revenueOps.add, updateRevenue: revenueOps.update, deleteRevenue: revenueOps.delete,
        addStaff: addStaff, updateStaff: updateStaff, deleteStaff: deleteStaff,
        addCommunication, updateCommunication, deleteCommunication,
        addAgendaItem, updateAgendaItem, deleteAgendaItem,
        addUser, updateUser, deleteUser,
        addLeadCaptureCampaign, 
        addPhotoAlbum, updatePhotoAlbum, deletePhotoAlbum, addPhotoToAlbum, addPhotosToAlbum, deletePhotoFromAlbum,
        addLibraryBook, updateLibraryBook, deleteLibraryBook,
        addTuitionPlan: tuitionPlanOps.add, updateTuitionPlan: tuitionPlanOps.update, deleteTuitionPlan: tuitionPlanOps.delete,
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