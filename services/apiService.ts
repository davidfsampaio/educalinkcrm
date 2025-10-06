import { mockStudents, mockInvoices, mockLeads, mockStaff, mockCommunications, mockAgendaItems, mockLibraryBooks, mockPhotoAlbums, financialSummaryData, mockUsers, mockExpenses, mockRevenues, mockLeadCaptureCampaigns } from '../data/mockData';
// FIX: Corrected import path for types.
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign } from '../types';

// FIX: Changed simulateDelay to be a generic function to preserve type information.
const simulateDelay = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 500));

export const getStudents = (): Promise<Student[]> => simulateDelay(mockStudents);
export const getInvoices = (): Promise<Invoice[]> => simulateDelay(mockInvoices);
export const getLeads = (): Promise<Lead[]> => simulateDelay(mockLeads);
export const getStaff = (): Promise<Staff[]> => simulateDelay(mockStaff);
export const getCommunications = (): Promise<Communication[]> => simulateDelay(mockCommunications);
export const getAgendaItems = (): Promise<AgendaItem[]> => simulateDelay(mockAgendaItems);
export const getLibraryBooks = (): Promise<LibraryBook[]> => simulateDelay(mockLibraryBooks);
export const getPhotoAlbums = (): Promise<PhotoAlbum[]> => simulateDelay(mockPhotoAlbums);
export const getFinancialSummary = (): Promise<FinancialSummaryPoint[]> => simulateDelay(financialSummaryData);
export const getUsers = (): Promise<User[]> => simulateDelay(mockUsers);
export const getExpenses = (): Promise<Expense[]> => simulateDelay(mockExpenses);
export const getRevenues = (): Promise<Revenue[]> => simulateDelay(mockRevenues);
export const getLeadCaptureCampaigns = (): Promise<LeadCaptureCampaign[]> => simulateDelay(mockLeadCaptureCampaigns);