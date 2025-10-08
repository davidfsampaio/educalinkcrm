import { mockStudents, mockInvoices, mockLeads, mockStaff, mockCommunications, mockAgendaItems, mockLibraryBooks, mockPhotoAlbums, financialSummaryData, mockUsers, mockExpenses, mockRevenues, mockLeadCaptureCampaigns } from '../data/mockData';
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, PhotoAlbum, FinancialSummaryPoint, User, Expense, Revenue, LeadCaptureCampaign } from '../types';

const DB_NAME = 'educalink-crm-db';
const DB_VERSION = 1;

// List of all object stores
const STORES = [
    'students', 'invoices', 'leads', 'staff', 'communications', 
    'agendaItems', 'libraryBooks', 'photoAlbums', 'users', 'expenses', 
    'revenues', 'leadCaptureCampaigns'
];

// Mock data mapping
const MOCK_DATA_MAP: { [key: string]: any[] } = {
    students: mockStudents,
    invoices: mockInvoices,
    leads: mockLeads,
    staff: mockStaff,
    communications: mockCommunications,
    agendaItems: mockAgendaItems,
    libraryBooks: mockLibraryBooks,
    photoAlbums: mockPhotoAlbums,
    users: mockUsers,
    expenses: mockExpenses,
    revenues: mockRevenues,
    leadCaptureCampaigns: mockLeadCaptureCampaigns,
};


// A promise that resolves with the DB connection
const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        STORES.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
                // Use 'id' as the key path for most stores. Invoices use a string ID.
                const keyPath = storeName === 'invoices' ? 'id' : 'id';
                db.createObjectStore(storeName, { keyPath });
            }
        });
    };
});

// Generic function to get all data from a store, seeding if empty
const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            if (request.result && request.result.length > 0) {
                resolve(request.result as T[]);
            } else {
                // If the store is empty, seed it with mock data
                const mockData = MOCK_DATA_MAP[storeName];
                if (mockData) {
                    const writeTransaction = db.transaction(storeName, 'readwrite');
                    const writeStore = writeTransaction.objectStore(storeName);
                    mockData.forEach(item => writeStore.put(item));
                    writeTransaction.oncomplete = () => resolve(mockData as T[]);
                    writeTransaction.onerror = () => reject(writeTransaction.error);
                } else {
                    resolve([]); // No mock data available
                }
            }
        };
    });
};

// Generic function to save an entire array to a store (by clearing and re-adding)
const saveAllToStore = async <T>(storeName: string, data: T[]): Promise<void> => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear(); // Clear existing data
        data.forEach(item => store.put(item)); // Add new data
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

// --- Exported API Functions ---

export const getStudents = (): Promise<Student[]> => getAllFromStore<Student>('students');
export const saveStudents = (data: Student[]): Promise<void> => saveAllToStore('students', data);

export const getInvoices = (): Promise<Invoice[]> => getAllFromStore<Invoice>('invoices');
export const saveInvoices = (data: Invoice[]): Promise<void> => saveAllToStore('invoices', data);

export const getLeads = (): Promise<Lead[]> => getAllFromStore<Lead>('leads');
export const saveLeads = (data: Lead[]): Promise<void> => saveAllToStore('leads', data);

export const getStaff = (): Promise<Staff[]> => getAllFromStore<Staff>('staff');
export const saveStaff = (data: Staff[]): Promise<void> => saveAllToStore('staff', data);

export const getCommunications = (): Promise<Communication[]> => getAllFromStore<Communication>('communications');
export const saveCommunications = (data: Communication[]): Promise<void> => saveAllToStore('communications', data);

export const getAgendaItems = (): Promise<AgendaItem[]> => getAllFromStore<AgendaItem>('agendaItems');
export const saveAgendaItems = (data: AgendaItem[]): Promise<void> => saveAllToStore('agendaItems', data);

export const getLibraryBooks = (): Promise<LibraryBook[]> => getAllFromStore<LibraryBook>('libraryBooks');
// libraryBooks are not saved in the current app logic

export const getPhotoAlbums = (): Promise<PhotoAlbum[]> => getAllFromStore<PhotoAlbum>('photoAlbums');
export const savePhotoAlbums = (data: PhotoAlbum[]): Promise<void> => saveAllToStore('photoAlbums', data);

export const getUsers = (): Promise<User[]> => getAllFromStore<User>('users');
export const saveUsers = (data: User[]): Promise<void> => saveAllToStore('users', data);

export const getExpenses = (): Promise<Expense[]> => getAllFromStore<Expense>('expenses');
export const saveExpenses = (data: Expense[]): Promise<void> => saveAllToStore('expenses', data);

export const getRevenues = (): Promise<Revenue[]> => getAllFromStore<Revenue>('revenues');
export const saveRevenues = (data: Revenue[]): Promise<void> => saveAllToStore('revenues', data);

export const getLeadCaptureCampaigns = (): Promise<LeadCaptureCampaign[]> => getAllFromStore<LeadCaptureCampaign>('leadCaptureCampaigns');
export const saveLeadCaptureCampaigns = (data: LeadCaptureCampaign[]): Promise<void> => saveAllToStore('leadCaptureCampaigns', data);

// Financial summary is static mock data, no need for IndexedDB
export const getFinancialSummary = (): Promise<FinancialSummaryPoint[]> => Promise.resolve(financialSummaryData);