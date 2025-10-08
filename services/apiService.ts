import { mockStudents, mockInvoices, mockLeads, mockStaff, mockCommunications, mockAgendaItems, mockLibraryBooks, mockPhotoAlbums, financialSummaryData, mockUsers, mockExpenses, mockRevenues, mockLeadCaptureCampaigns } from '../data/mockData';
// FIX: Corrected import path for types.
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign } from '../types';

// Helper function to get data from localStorage or initialize it with mock data
const getData = <T>(key: string, mockData: T): T => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
    }
    // If no data or on error, initialize with mock data and save it
    try {
        localStorage.setItem(key, JSON.stringify(mockData));
    } catch (error) {
        console.error(`Error saving initial mock data for ${key} to localStorage`, error);
    }
    return mockData;
};

// Helper function to save data to localStorage
const saveData = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


// FIX: Changed simulateDelay to be a generic function to preserve type information.
const simulateDelay = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 100)); // Reduced delay for faster UI feedback

export const getStudents = (): Promise<Student[]> => simulateDelay(getData('students', mockStudents));
export const saveStudents = (data: Student[]): void => saveData('students', data);

export const getInvoices = (): Promise<Invoice[]> => simulateDelay(getData('invoices', mockInvoices));
export const saveInvoices = (data: Invoice[]): void => saveData('invoices', data);

export const getLeads = (): Promise<Lead[]> => simulateDelay(getData('leads', mockLeads));
export const saveLeads = (data: Lead[]): void => saveData('leads', data);

export const getStaff = (): Promise<Staff[]> => simulateDelay(getData('staff', mockStaff));
export const saveStaff = (data: Staff[]): void => saveData('staff', data);

export const getCommunications = (): Promise<Communication[]> => simulateDelay(getData('communications', mockCommunications));
export const saveCommunications = (data: Communication[]): void => saveData('communications', data);

export const getAgendaItems = (): Promise<AgendaItem[]> => simulateDelay(getData('agendaItems', mockAgendaItems));
export const saveAgendaItems = (data: AgendaItem[]): void => saveData('agendaItems', data);

export const getLibraryBooks = (): Promise<LibraryBook[]> => simulateDelay(getData('libraryBooks', mockLibraryBooks));

export const getPhotoAlbums = (): Promise<PhotoAlbum[]> => simulateDelay(getData('photoAlbums', mockPhotoAlbums));
export const savePhotoAlbums = (data: PhotoAlbum[]): void => saveData('photoAlbums', data);

export const getFinancialSummary = (): Promise<FinancialSummaryPoint[]> => simulateDelay(financialSummaryData); // This one doesn't need saving as it's static for the demo

export const getUsers = (): Promise<User[]> => simulateDelay(getData('users', mockUsers));
export const saveUsers = (data: User[]): void => saveData('users', data);

export const getExpenses = (): Promise<Expense[]> => simulateDelay(getData('expenses', mockExpenses));
export const saveExpenses = (data: Expense[]): void => saveData('expenses', data);

export const getRevenues = (): Promise<Revenue[]> => simulateDelay(getData('revenues', mockRevenues));
export const saveRevenues = (data: Revenue[]): void => saveData('revenues', data);

export const getLeadCaptureCampaigns = (): Promise<LeadCaptureCampaign[]> => simulateDelay(getData('leadCaptureCampaigns', mockLeadCaptureCampaigns));
export const saveLeadCaptureCampaigns = (data: LeadCaptureCampaign[]): void => saveData('leadCaptureCampaigns', data);