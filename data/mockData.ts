// FIX: Added 'IndividualAgendaItemType' to the import list to resolve a TypeScript error.
import { Student, Invoice, Lead, Staff, Communication, AgendaItem, LibraryBook, TuitionPlan, PhotoAlbum, User, UserRoleName, UserStatus, Expense, Revenue, ExpenseCategory, RevenueCategory, AgendaItemType, LeadStatus, StudentStatus, StaffStatus, PaymentStatus, LeadCaptureCampaign, IndividualAgendaItemType } from '../types';

const MOCK_SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';

export const mockStudents: Student[] = [
    { id: 1, name: 'Lucas Silva', class: 'Turma A', enrollment_date: '2023-02-01', status: StudentStatus.Active, parent_name: 'Ana Silva', parent_contact: '(11) 91234-5678', avatar_url: 'https://picsum.photos/seed/student1/100/100', cpf: '123.456.789-10', address: 'Rua das Flores, 123', email: 'ana.silva@email.com', phone: '(11) 91234-5678', tuition_plan_id: 1, medical_notes: 'Alergia a amendoim.', grades: [{subject: 'Matemática', score: 8.5, term: '1º Trimestre', type: 'Prova', weight: 2}, {subject: 'Português', score: 9.0, term: '1º Trimestre', type: 'Prova', weight: 2}], attendance: [{date: '2024-07-28', status: 'Presente'}], occurrences: [], documents: [], individualAgenda: [{id: 1, date: '2024-07-29', createdAt: '2024-07-29T10:00:00Z', type: IndividualAgendaItemType.Alimentacao, selections: ['Comeu tudo'], description: 'Almoçou bem!', isSent: true}], communicationLog: [], school_id: MOCK_SCHOOL_ID },
    { id: 2, name: 'Mariana Oliveira', class: 'Turma B', enrollment_date: '2023-02-01', status: StudentStatus.Active, parent_name: 'João Oliveira', parent_contact: '(11) 92345-6789', avatar_url: 'https://picsum.photos/seed/student2/100/100', cpf: '234.567.890-12', address: 'Avenida Brasil, 456', email: 'joao.oliveira@email.com', phone: '(11) 92345-6789', tuition_plan_id: 2, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
    { id: 3, name: 'Pedro Santos', class: 'Turma A', enrollment_date: '2022-08-10', status: StudentStatus.Active, parent_name: 'Carla Santos', parent_contact: '(11) 93456-7890', avatar_url: 'https://picsum.photos/seed/student3/100/100', cpf: '345.678.901-23', address: 'Praça da Sé, 789', email: 'carla.santos@email.com', phone: '(11) 93456-7890', tuition_plan_id: 1, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
    { id: 4, name: 'Julia Souza', class: 'Turma C', enrollment_date: '2023-02-01', status: StudentStatus.Inactive, parent_name: 'Marcos Souza', parent_contact: '(11) 94567-8901', avatar_url: 'https://picsum.photos/seed/student4/100/100', cpf: '456.789.012-34', address: 'Rua Augusta, 101', email: 'marcos.souza@email.com', phone: '(11) 94567-8901', tuition_plan_id: 2, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
];
export const mockInvoices: Invoice[] = [
    { id: 'INV-20240701', studentId: 1, studentName: 'Lucas Silva', amount: 850.00, dueDate: '2024-07-05', status: PaymentStatus.Overdue, payments: [], school_id: MOCK_SCHOOL_ID },
    { id: 'INV-20240702', studentId: 2, studentName: 'Mariana Oliveira', amount: 1350.00, dueDate: '2024-07-05', status: PaymentStatus.Paid, paidDate: '2024-07-03', payments: [{ id: 1, amount: 1350, date: '2024-07-03', method: 'PIX' }], school_id: MOCK_SCHOOL_ID },
    { id: 'INV-20240703', studentId: 3, studentName: 'Pedro Santos', amount: 850.00, dueDate: '2024-08-05', status: PaymentStatus.Pending, payments: [], school_id: MOCK_SCHOOL_ID },
    { id: 'INV-20240601', studentId: 1, studentName: 'Lucas Silva', amount: 850.00, dueDate: '2024-06-05', status: PaymentStatus.Paid, paidDate: '2024-06-04', payments: [{ id: 2, amount: 850, date: '2024-06-04', method: 'Boleto' }], school_id: MOCK_SCHOOL_ID },
];
export const mockLeads: Lead[] = [
    { id: 1, name: 'Família Andrade', parentName: 'Beatriz Andrade', contact: '(11) 95678-9012', status: LeadStatus.New, interestDate: '2024-07-10', notes: 'Interesse na Turma B para o filho João.', tasks: [], isConverted: false, requiredDocuments: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
    { id: 2, name: 'Família Costa', parentName: 'Ricardo Costa', contact: 'ricardo.costa@email.com', status: LeadStatus.Contacted, interestDate: '2024-07-08', notes: 'Primeiro contato realizado. Agendar visita.', tasks: [{ id: 1, description: 'Agendar visita para a próxima semana', isCompleted: false }], isConverted: false, requiredDocuments: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
    { id: 3, name: 'Família Ferreira', parentName: 'Fernanda Ferreira', contact: '(11) 96789-0123', status: LeadStatus.VisitScheduled, interestDate: '2024-07-05', notes: 'Visita agendada para 15/07.', tasks: [], isConverted: false, requiredDocuments: [], communicationLog: [], school_id: MOCK_SCHOOL_ID },
];
export const mockStaff: Staff[] = [
    { id: 1, name: 'Diretor(a) Admin', role: 'Diretor(a)', email: 'admin@educalink.com', phone: '(11) 98765-4321', hireDate: '2020-01-15', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/user/100/100', cpf: '111.111.111-11', address: 'Rua da Escola, 1', school_id: MOCK_SCHOOL_ID },
    { id: 2, name: 'Maria Secretária', role: 'Secretário(a)', email: 'secretaria@educalink.com', phone: '(11) 98765-4322', hireDate: '2021-03-20', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff2/100/100', cpf: '222.222.222-22', address: 'Rua da Escola, 2', school_id: MOCK_SCHOOL_ID },
    { id: 3, name: 'Carlos Coordenador', role: 'Coordenador(a)', email: 'coordenador@educalink.com', phone: '(11) 98765-4323', hireDate: '2019-08-01', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff3/100/100', cpf: '333.333.333-33', address: 'Rua da Escola, 3', school_id: MOCK_SCHOOL_ID },
    { id: 4, name: 'Professora Joana', role: 'Professor(a)', email: 'joana.prof@educalink.com', phone: '(11) 98765-4324', hireDate: '2022-02-10', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff4/100/100', cpf: '444.444.444-44', address: 'Rua da Escola, 4', school_id: MOCK_SCHOOL_ID },
];
export const mockUsers: User[] = [
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Diretor(a)', email: 'admin@educalink.com', role: 'Admin', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user/100/100', school_id: MOCK_SCHOOL_ID },
    { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'Maria Secretária', email: 'secretaria@educalink.com', role: 'Secretário(a)', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user2/100/100', school_id: MOCK_SCHOOL_ID },
    { id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', name: 'Carlos Coordenador', email: 'coordenador@educalink.com', role: 'Coordenador(a)', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user3/100/100', school_id: MOCK_SCHOOL_ID },
    { id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123', name: 'Ana Silva (Responsável)', email: 'ana.silva@email.com', role: 'Pai/Responsável', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user4/100/100', studentId: 1, school_id: MOCK_SCHOOL_ID },
];
export const mockLeadCaptureCampaigns: LeadCaptureCampaign[] = [
    { id: 'campaign-1', name: 'Matrículas 2025 - Facebook', publicUrl: '/#/capture/campaign-1', createdAt: '2024-07-01', leadsCaptured: 12, school_id: MOCK_SCHOOL_ID },
    { id: 'campaign-2', name: 'Google Ads - Período Integral', publicUrl: '/#/capture/campaign-2', createdAt: '2024-06-20', leadsCaptured: 8, school_id: MOCK_SCHOOL_ID },
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
    { id: 1, title: 'Reunião de Pais e Mestres', content: 'Prezados pais e responsáveis, gostaríamos de convidá-los para a nossa reunião trimestral de pais e mestres, que ocorrerá no dia 30 de Julho.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-15', school_id: MOCK_SCHOOL_ID },
    { id: 2, title: 'Festa Junina', content: 'A nossa tradicional Festa Junina será no próximo sábado, dia 29 de Junho! Contamos com a presença de todos para uma tarde de muita diversão.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-10', school_id: MOCK_SCHOOL_ID },
    { id: 3, title: 'Atualização do Calendário', content: 'Informamos que o dia 15 de Agosto será feriado escolar. Não haverá aula neste dia.', recipientGroup: 'Todos', sentDate: '2024-06-05', school_id: MOCK_SCHOOL_ID },
];

export const mockAgendaItems: AgendaItem[] = [
    { id: 1, date: '2024-07-25', title: 'Reunião de Pais - Turma C', description: 'Discussão sobre o progresso do semestre e apresentação dos projetos.', type: AgendaItemType.Event, classTarget: 'Turma C', isSent: true, school_id: MOCK_SCHOOL_ID },
    { id: 2, date: '2024-08-10', title: 'Feira de Ciências', description: 'Apresentação dos projetos dos alunos do Ensino Fundamental. Aberto aos pais.', type: AgendaItemType.Event, classTarget: 'Todas as Turmas', isSent: false, school_id: MOCK_SCHOOL_ID },
    { id: 5, date: '2024-07-20', title: 'Pagamento da Mensalidade', description: 'Lembramos que o vencimento da mensalidade de Agosto é no dia 05.', type: AgendaItemType.Reminder, classTarget: 'Todas as Turmas', isSent: false, school_id: MOCK_SCHOOL_ID },
];

export const mockLibraryBooks: LibraryBook[] = [
    { id: 1, title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-8582850308', status: 'Disponível', school_id: MOCK_SCHOOL_ID },
    { id: 2, title: 'A Menina que Roubava Livros', author: 'Markus Zusak', isbn: '978-8598078275', status: 'Disponível', school_id: MOCK_SCHOOL_ID },
    { id: 3, title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', isbn: '978-8532530278', status: 'Disponível', school_id: MOCK_SCHOOL_ID },
    { id: 4, title: 'O Diário de Anne Frank', author: 'Anne Frank', isbn: '978-8501044457', status: 'Disponível', school_id: MOCK_SCHOOL_ID },
    { id: 5, title: 'Capitães da Areia', author: 'Jorge Amado', isbn: '978-8535914104', status: 'Disponível', school_id: MOCK_SCHOOL_ID },
];

export const mockTuitionPlans: TuitionPlan[] = [
    { id: 1, name: 'Meio Período', amount: 850.00, school_id: MOCK_SCHOOL_ID },
    { id: 2, name: 'Período Integral', amount: 1350.00, school_id: MOCK_SCHOOL_ID },
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
        ],
        school_id: MOCK_SCHOOL_ID
    },
    {
        id: 2,
        title: "Dia das Crianças",
        date: "2023-10-12",
        coverUrl: "https://picsum.photos/seed/diadascriancas/400/300",
        photos: [
            { id: 1, url: "https://picsum.photos/seed/criancas1/800/600", caption: "Gincana no pátio da escola." },
            { id: 2, url: "https://picsum.photos/seed/criancas2/800/600", caption: "Pintura facial com os professores." },
        ],
        school_id: MOCK_SCHOOL_ID
    }
];

export const mockExpenses: Expense[] = [
    { id: 1, description: 'Pagamento de Salários - Julho', category: ExpenseCategory.Salaries, amount: 25000, date: '2024-07-05', school_id: MOCK_SCHOOL_ID },
    { id: 2, description: 'Conta de Energia Elétrica', category: ExpenseCategory.Rent, amount: 1200, date: '2024-07-10', school_id: MOCK_SCHOOL_ID },
    { id: 3, description: 'Compra de Papel Sulfite', category: ExpenseCategory.Supplies, amount: 350, date: '2024-07-12', school_id: MOCK_SCHOOL_ID },
    { id: 4, description: 'Conserto do portão de entrada', category: ExpenseCategory.Maintenance, amount: 800, date: '2024-07-15', school_id: MOCK_SCHOOL_ID },
    { id: 5, description: 'Anúncio em Mídia Social', category: ExpenseCategory.Marketing, amount: 500, date: '2024-07-18', school_id: MOCK_SCHOOL_ID },
];

export const mockRevenues: Revenue[] = [
    { id: 1, description: 'Receita da Festa Junina', category: RevenueCategory.Events, amount: 5500, date: '2024-06-30', school_id: MOCK_SCHOOL_ID },
    { id: 2, description: 'Venda de Uniformes', category: RevenueCategory.Materials, amount: 1500, date: '2024-07-08', school_id: MOCK_SCHOOL_ID },
    { id: 3, description: 'Doação Anônima', category: RevenueCategory.Donations, amount: 1000, date: '2024-07-20', school_id: MOCK_SCHOOL_ID },
];