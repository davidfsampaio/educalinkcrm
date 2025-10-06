import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// FIX: Corrected import path for types.
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue } from '../types';
import * as api from '../services/apiService';

interface DataContextType {
    students: Student[];
    invoices: Invoice[];
    leads: Lead[];
    staff: Staff[];
    users: User[];
    communications: Communication[];
    agendaItems: AgendaItem[];
    libraryBooks: LibraryBook[];
    photoAlbums: PhotoAlbum[];
    financialSummary: FinancialSummaryPoint[];
    expenses: Expense[];
    revenues: Revenue[];
    loading: boolean;
}

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
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
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const value = { students, invoices, leads, staff, users, communications, agendaItems, libraryBooks, photoAlbums, financialSummary, expenses, revenues, loading };

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