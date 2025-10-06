import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, TuitionPlan, PhotoAlbum, User, UserRoleName, UserStatus, Expense, Revenue, ExpenseCategory, RevenueCategory, AgendaItemType, LeadStatus, StudentStatus, StaffStatus, PaymentStatus, LeadCaptureCampaign } from '../types';

export const mockStudents: Student[] = [
    { 
        id: 1, name: 'Ana Clara Souza', class: 'Turma A', enrollmentDate: '2023-01-15', status: StudentStatus.Active, parentName: 'Marcos Souza', parentContact: '(11) 98765-4321', avatarUrl: 'https://picsum.photos/seed/student1/100/100', cpf: '123.456.789-10', address: 'Rua das Flores, 123', email: 'marcos.souza@example.com', phone: '(11) 98765-4321', tuitionPlanId: 1, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: []
    },
    { 
        id: 2, name: 'Lucas Oliveira', class: 'Turma B', enrollmentDate: '2023-01-16', status: StudentStatus.Active, parentName: 'Fernanda Oliveira', parentContact: '(21) 91234-5678', avatarUrl: 'https://picsum.photos/seed/student2/100/100', cpf: '234.567.890-11', address: 'Avenida Principal, 456', email: 'fernanda.oliveira@example.com', phone: '(21) 91234-5678', tuitionPlanId: 2, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: []
    },
];

export const mockInvoices: Invoice[] = [
    { id: 'INV-20240701', studentName: 'Ana Clara Souza', studentId: 1, amount: 850.00, dueDate: '2024-07-05', status: PaymentStatus.Paid, paidDate: '2024-07-03', payments: [] },
    { id: 'INV-20240702', studentName: 'Lucas Oliveira', studentId: 2, amount: 1350.00, dueDate: '2024-07-05', status: PaymentStatus.Pending, payments: [] },
];

export const mockLeads: Lead[] = [
    { id: 1, name: 'Família Silva', parentName: 'Carlos Silva', contact: '(11) 99999-8888', status: LeadStatus.New, interestDate: '2024-07-10', notes: 'Interesse no período integral.', tasks: [], isConverted: false, requiredDocuments: [], communicationLog: [] },
    { id: 2, name: 'Família Pereira', parentName: 'Juliana Pereira', contact: 'juliana.p@example.com', status: LeadStatus.Contacted, interestDate: '2024-07-08', notes: 'Solicitou visita.', tasks: [], isConverted: false, requiredDocuments: [], communicationLog: [] },
];

export const mockStaff: Staff[] = [
    { id: 1, name: 'Mariana Costa', role: 'Coordenador(a)', email: 'mariana.costa@educalink.com', phone: '(11) 98888-7777', hireDate: '2022-02-01', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff1/100/100', cpf: '345.678.901-22', address: 'Rua dos Professores, 789' },
    { id: 2, name: 'Ricardo Alves', role: 'Professor(a)', email: 'ricardo.alves@educalink.com', phone: '(11) 97777-6666', hireDate: '2022-08-10', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff2/100/100', cpf: '456.789.012-33', address: 'Avenida da Escola, 101' },
];


export const mockUsers: User[] = [
    { id: 1, name: 'Administrador', email: 'admin@educalink.com', role: 'Admin', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
];

export const mockLeadCaptureCampaigns: LeadCaptureCampaign[] = [];

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