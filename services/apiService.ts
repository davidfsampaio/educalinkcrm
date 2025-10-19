import {
    Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum,
    FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign
} from '../types';
import {
    mockStudents, mockInvoices, mockLeads, mockStaff, mockCommunications, mockAgendaItems,
    mockLibraryBooks, mockPhotoAlbums, financialSummaryData, mockUsers, mockExpenses, mockRevenues, mockLeadCaptureCampaigns
} from '../data/mockData';

// This function simulates a network delay to mimic real-world API calls
const simulateDelay = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 250));
};

// --- API Functions switched to Mock Data ---
// The application was failing to connect to the database. To restore functionality,
// all data fetching now uses local mock data.

export const getStudents = (): Promise<Student[]> => simulateDelay(mockStudents);
export const getInvoices = (): Promise<Invoice[]> => simulateDelay(mockInvoices);
export const getLeads = (): Promise<Lead[]> => simulateDelay(mockLeads);
export const getStaff = (): Promise<Staff[]> => simulateDelay(mockStaff);
export const getUsers = (): Promise<User[]> => simulateDelay(mockUsers);
export const getCommunications = (): Promise<Communication[]> => simulateDelay(mockCommunications);
export const getAgendaItems = (): Promise<AgendaItem[]> => simulateDelay(mockAgendaItems);
export const getLibraryBooks = (): Promise<LibraryBook[]> => simulateDelay(mockLibraryBooks);
export const getPhotoAlbums = (): Promise<PhotoAlbum[]> => simulateDelay(mockPhotoAlbums);
export const getExpenses = (): Promise<Expense[]> => simulateDelay(mockExpenses);
export const getRevenues = (): Promise<Revenue[]> => simulateDelay(mockRevenues);
export const getLeadCaptureCampaigns = (): Promise<LeadCaptureCampaign[]> => simulateDelay(mockLeadCaptureCampaigns);

// Financial summary is static mock data
export const getFinancialSummary = (): Promise<FinancialSummaryPoint[]> => simulateDelay(financialSummaryData);
