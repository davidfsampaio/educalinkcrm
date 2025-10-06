import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, TuitionPlan, PhotoAlbum, User, UserRoleName, UserStatus, Expense, Revenue, ExpenseCategory, RevenueCategory, AgendaItemType } from '../types';

// Data cleared for production setup
export const mockStudents: Student[] = [];

export const mockInvoices: Invoice[] = [];

export const mockLeads: Lead[] = [];

export const mockStaff: Staff[] = [];


export const mockUsers: User[] = [
    { id: 1, name: 'Administrador', email: 'admin@educalink.com', role: 'Admin', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
];


// --- Generic data that can be kept ---

export const financialSummaryData = [
    { name: 'Jan', revenue: 45000, expenses: 24000 },
    { name: 'Fev', revenue: 48000, expenses: 26000 },
    { name: 'Mar', revenue: 52000, expenses: 25000 },
    { name: 'Abr', revenue: 51000, expenses: 28000 },
    { name: 'Mai', revenue: 53000, expenses: 27000 },
    { name: 'Jun', revenue: 55000, expenses: 30000 },
];


export const mockCommunications: Communication[] = [
    { id: 1, title: 'Reunião de Pais e Mestres', content: 'Prezados pais e responsáveis, gostaríamos de convidá-los para a nossa reunião trimestral de pais e mestres, que ocorrerá no dia 30 de Julho.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-15' },
    { id: 2, title: 'Festa Junina', content: 'A nossa tradicional Festa Junina será no próximo sábado, dia 29 de Junho! Contamos com a presença de todos para uma tarde de muita diversão.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-10' },
    { id: 3, title: 'Atualização do Calendário', content: 'Informamos que o dia 15 de Agosto será feriado escolar. Não haverá aula neste dia.', recipientGroup: 'Todos', sentDate: '2024-06-05' },
];

export const mockAgendaItems: AgendaItem[] = [
    // FIX: Used AgendaItemType enum members for the 'type' property to align with type definitions.
    { id: 1, date: '2024-07-25', title: 'Reunião de Pais - Turma C', description: 'Discussão sobre o progresso do semestre e apresentação dos projetos.', type: AgendaItemType.Event, classTarget: 'Turma C', isSent: true },
    { id: 2, date: '2024-08-10', title: 'Feira de Ciências', description: 'Apresentação dos projetos dos alunos do Ensino Fundamental. Aberto aos pais.', type: AgendaItemType.Event, classTarget: 'Todas as Turmas', isSent: false },
    { id: 5, date: '2024-07-20', title: 'Pagamento da Mensalidade', description: 'Lembramos que o vencimento da mensalidade de Agosto é no dia 05.', type: AgendaItemType.Reminder, classTarget: 'Todas as Turmas', isSent: false },
];

export const mockLibraryBooks: LibraryBook[] = [
    { id: 1, title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-8582850308', status: 'Disponível' },
    { id: 2, title: 'A Menina que Roubava Livros', author: 'Markus Zusak', isbn: '978-8598078275', status: 'Disponível' },
    { id: 3, title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', isbn: '978-8532530278', status: 'Disponível' },
    { id: 4, title: 'O Diário de Anne Frank', author: 'Anne Frank', isbn: '978-8501044457', status: 'Disponível' },
    { id: 5, title: 'Capitães da Areia', author: 'Jorge Amado', isbn: '978-8535914104', status: 'Disponível' },
];

export const mockTuitionPlans: TuitionPlan[] = [
    { id: 1, name: 'Meio Período', amount: 850.00 },
    { id: 2, name: 'Período Integral', amount: 1350.00 },
];

export const mockPhotoAlbums: PhotoAlbum[] = [
    {
        id: 1,
        title: "Festa Junina 2024",
        date: "2024-06-29",
        coverUrl: "https://picsum.photos/seed/festajunina/400/300",
        photos: [
            { id: 1, url: "https://picsum.photos/seed/junina1/800/600", caption: "Dança da quadrilha da Turma A." },
            { id: 2, url: "https://picsum.photos/seed/junina2/800/600", caption: "Alunos se divertindo na pescaria." },
            { id: 3, url: "https://picsum.photos/seed/junina3/800/600", caption: "Comidas típicas deliciosas!" },
        ]
    },
    {
        id: 2,
        title: "Dia das Crianças",
        date: "2023-10-12",
        coverUrl: "https://picsum.photos/seed/diadascriancas/400/300",
        photos: [
            { id: 1, url: "https://picsum.photos/seed/criancas1/800/600", caption: "Gincana no pátio da escola." },
            { id: 2, url: "https://picsum.photos/seed/criancas2/800/600", caption: "Pintura facial com os professores." },
        ]
    }
];

export const mockExpenses: Expense[] = [
    { id: 1, description: 'Pagamento de Salários - Julho', category: ExpenseCategory.Salaries, amount: 25000, date: '2024-07-05' },
    { id: 2, description: 'Conta de Energia Elétrica', category: ExpenseCategory.Rent, amount: 1200, date: '2024-07-10' },
    { id: 3, description: 'Compra de Papel Sulfite', category: ExpenseCategory.Supplies, amount: 350, date: '2024-07-12' },
    { id: 4, description: 'Conserto do portão de entrada', category: ExpenseCategory.Maintenance, amount: 800, date: '2024-07-15' },
    { id: 5, description: 'Anúncio em Mídia Social', category: ExpenseCategory.Marketing, amount: 500, date: '2024-07-18' },
];

export const mockRevenues: Revenue[] = [
    { id: 1, description: 'Receita da Festa Junina', category: RevenueCategory.Events, amount: 5500, date: '2024-06-30' },
    { id: 2, description: 'Venda de Uniformes', category: RevenueCategory.Materials, amount: 1500, date: '2024-07-08' },
    { id: 3, description: 'Doação Anônima', category: RevenueCategory.Donations, amount: 1000, date: '2024-07-20' },
];