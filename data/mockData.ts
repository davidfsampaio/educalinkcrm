// FIX: Corrected import path for types.
import { Student, StudentStatus, Invoice, PaymentStatus, Lead, LeadStatus, Task, Staff, StaffStatus, StaffRole, Communication, AgendaItem, AgendaItemType, Grade, Attendance, Occurrence, IndividualAgendaItem, IndividualAgendaItemType, Document, RequiredDocument, CommunicationLog, LibraryBook, TuitionPlan, PhotoAlbum, User, UserRoleName, UserStatus, Expense, Revenue, ExpenseCategory, RevenueCategory } from '../types';

const mockGrades = (): Grade[] => [
    { subject: 'Matemática', score: 8.5, term: '1º Trimestre', type: 'Prova', weight: 2 },
    { subject: 'Matemática', score: 7.0, term: '1º Trimestre', type: 'Trabalho', weight: 1 },
    { subject: 'Português', score: 9.0, term: '1º Trimestre', type: 'Prova', weight: 2 },
    { subject: 'Português', score: 9.5, term: '1º Trimestre', type: 'Participação', weight: 1 },
    { subject: 'Ciências', score: 7.8, term: '1º Trimestre', type: 'Prova', weight: 2 },
    { subject: 'História', score: 8.2, term: '1º Trimestre', type: 'Prova', weight: 2 },
];

const mockAttendance = (): Attendance[] => [
    { date: '2024-07-15', status: 'Presente' },
    { date: '2024-07-16', status: 'Presente' },
    { date: '2024-07-17', status: 'Ausente' },
    { date: '2024-07-18', status: 'Presente' },
];

const mockOccurrences = (): Occurrence[] => [
    { id: 1, date: '2024-05-20', type: 'Pedagógica', description: 'Demonstrou excelente participação na apresentação do projeto de ciências.' },
    { id: 2, date: '2024-06-10', type: 'Disciplinar', description: 'Conversou durante a explicação da atividade.' },
];

const mockIndividualAgenda = (): IndividualAgendaItem[] => [
    { id: 1, date: '2024-07-18', type: IndividualAgendaItemType.Alimentacao, description: 'Comeu todo o lanche da tarde (maçã e biscoito).', isSent: true },
    { id: 2, date: '2024-07-18', type: IndividualAgendaItemType.Atividade, description: 'Participou da atividade de pintura com guache.', isSent: true },
    { id: 3, date: '2024-07-19', type: IndividualAgendaItemType.Observacao, description: 'Estava um pouco sonolento após o almoço.', isSent: false },
];

const mockDocuments = (): Document[] => [
    { id: 1, title: 'Certidão de Nascimento', uploadDate: '2023-01-10', url: '#' },
    { id: 2, title: 'Carteira de Vacinação', uploadDate: '2023-01-10', url: '#' },
];

const mockCommunicationLog = (): CommunicationLog[] => [
    { id: 1, date: '2024-07-10', type: 'Ligação', summary: 'Responsável contatado para discutir o desempenho do aluno.' },
    { id: 2, date: '2024-06-20', type: 'Reunião', summary: 'Reunião de pais e mestres.' },
];

export const mockStudents: Student[] = [
    { id: 1, name: 'Ana Silva', class: 'Turma A', enrollmentDate: '2023-01-15', status: StudentStatus.Active, parentName: 'João Silva', parentContact: '(11) 98765-4321', avatarUrl: 'https://picsum.photos/seed/student1/100/100', cpf: '123.456.789-01', address: 'Rua das Flores, 123, São Paulo, SP', email: 'joao.silva@email.com', phone: '(11) 98765-4321', medicalNotes: 'Alergia a amendoim. Evitar qualquer alimento que contenha o ingrediente.', tuitionPlanId: 1, grades: mockGrades(), attendance: mockAttendance(), occurrences: mockOccurrences(), documents: mockDocuments(), individualAgenda: mockIndividualAgenda(), communicationLog: mockCommunicationLog() },
    { id: 2, name: 'Bruno Costa', class: 'Turma B', enrollmentDate: '2023-01-18', status: StudentStatus.Active, parentName: 'Maria Costa', parentContact: '(11) 91234-5678', avatarUrl: 'https://picsum.photos/seed/student2/100/100', cpf: '234.567.890-12', address: 'Av. Principal, 456, São Paulo, SP', email: 'maria.costa@email.com', phone: '(11) 91234-5678', medicalNotes: '', tuitionPlanId: 1, grades: mockGrades(), attendance: mockAttendance(), occurrences: [], documents: mockDocuments(), individualAgenda: [], communicationLog: [] },
    { id: 3, name: 'Carlos Dias', class: 'Turma A', enrollmentDate: '2022-02-10', status: StudentStatus.Inactive, parentName: 'José Dias', parentContact: '(11) 95555-1234', avatarUrl: 'https://picsum.photos/seed/student3/100/100', cpf: '345.678.901-23', address: 'Rua da Paz, 789, São Paulo, SP', email: 'jose.dias@email.com', phone: '(11) 95555-1234', medicalNotes: '', tuitionPlanId: 2, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [] },
    { id: 4, name: 'Daniela Souza', class: 'Turma C', enrollmentDate: '2024-02-01', status: StudentStatus.Active, parentName: 'Paulo Souza', parentContact: '(11) 94444-5678', avatarUrl: 'https://picsum.photos/seed/student4/100/100', cpf: '456.789.012-34', address: 'Alameda dos Anjos, 101, São Paulo, SP', email: 'paulo.souza@email.com', phone: '(11) 94444-5678', medicalNotes: '', tuitionPlanId: 2, grades: mockGrades(), attendance: mockAttendance(), occurrences: [], documents: mockDocuments(), individualAgenda: [], communicationLog: [] },
    { id: 5, name: 'Eduarda Lima', class: 'Turma B', enrollmentDate: '2021-03-12', status: StudentStatus.Graduated, parentName: 'Fernanda Lima', parentContact: '(11) 93333-8765', avatarUrl: 'https://picsum.photos/seed/student5/100/100', cpf: '567.890.123-45', address: 'Rua do Sol, 212, São Paulo, SP', email: 'fernanda.lima@email.com', phone: '(11) 93333-8765', medicalNotes: '', tuitionPlanId: 1, grades: [], attendance: [], occurrences: [], documents: [], individualAgenda: [], communicationLog: [] },
    { id: 6, name: 'Felipe Martins', class: 'Turma C', enrollmentDate: '2023-01-20', status: StudentStatus.Active, parentName: 'Ricardo Martins', parentContact: '(11) 92222-4321', avatarUrl: 'https://picsum.photos/seed/student6/100/100', cpf: '678.901.234-56', address: 'Travessa da Lua, 313, São Paulo, SP', email: 'ricardo.martins@email.com', phone: '(11) 92222-4321', tuitionPlanId: 2, grades: mockGrades(), attendance: mockAttendance(), occurrences: [], documents: mockDocuments(), individualAgenda: [], communicationLog: [] },
];

export const mockInvoices: Invoice[] = [
    { id: 'INV-001', studentName: 'Ana Silva', studentId: 1, amount: 850.00, dueDate: '2024-06-05', paidDate: '2024-06-04', status: PaymentStatus.Paid, payments: [{id: 1, amount: 850.00, date: '2024-06-04', method: 'Boleto'}] },
    { id: 'INV-002', studentName: 'Bruno Costa', studentId: 2, amount: 850.00, dueDate: '2024-07-05', status: PaymentStatus.Pending, payments: [] },
    { id: 'INV-003', studentName: 'Carlos Dias', studentId: 3, amount: 850.00, dueDate: '2024-05-05', status: PaymentStatus.Overdue, payments: [] },
    { id: 'INV-004', studentName: 'Daniela Souza', studentId: 4, amount: 950.00, dueDate: '2024-07-05', status: PaymentStatus.Pending, payments: [] },
    { id: 'INV-005', studentName: 'Felipe Martins', studentId: 6, amount: 950.00, dueDate: '2024-06-05', paidDate: '2024-06-01', status: PaymentStatus.Paid, payments: [{id: 1, amount: 950.00, date: '2024-06-01', method: 'PIX'}] },
    { id: 'INV-006', studentName: 'Ana Silva', studentId: 1, amount: 850.00, dueDate: '2024-05-05', status: PaymentStatus.Overdue, payments: [] },
    { id: 'INV-007', studentName: 'Bruno Costa', studentId: 2, amount: 850.00, dueDate: '2024-06-05', paidDate: '2024-06-05', status: PaymentStatus.Paid, payments: [{id: 1, amount: 850.00, date: '2024-06-05', method: 'Cartão de Crédito'}] },

];

const defaultTask: Task = { id: 1, description: 'Realizar primeiro contato', isCompleted: false };
const visitTask: Task[] = [{ id: 1, description: 'Realizar primeiro contato', isCompleted: true }, { id: 2, description: 'Agendar visita', isCompleted: false }];
const confirmVisitTask: Task[] = [...visitTask.slice(0,1), {id: 2, description: 'Agendar visita', isCompleted: true}, {id: 3, description: 'Confirmar visita um dia antes', isCompleted: false}];
const defaultRequiredDocs: RequiredDocument[] = [
    { name: 'Certidão de Nascimento', status: 'Pendente' },
    { name: 'RG/CPF do Responsável', status: 'Pendente' },
    { name: 'Comprovante de Residência', status: 'Pendente' },
    { name: 'Carteira de Vacinação', status: 'Pendente' },
];

export const mockLeads: Lead[] = [
    { id: 1, name: 'Família Oliveira', parentName: 'Fernanda Oliveira', contact: '(11) 98888-7777', status: LeadStatus.New, interestDate: '2024-06-20', notes: 'Interesse na Turma A.', tasks: [defaultTask], isConverted: false, requiredDocuments: defaultRequiredDocs, communicationLog: [] },
    { id: 2, name: 'Família Pereira', parentName: 'Ricardo Pereira', contact: '(11) 96666-5555', status: LeadStatus.Contacted, interestDate: '2024-06-18', notes: 'Contato realizado, aguardando melhor horário para ligação.', tasks: visitTask, isConverted: false, requiredDocuments: defaultRequiredDocs, communicationLog: [{id: 1, date: '2024-06-18', type: 'Ligação', summary: 'Primeiro contato realizado. Responsável pediu para retornar amanhã.'}] },
    { id: 3, name: 'Família Souza', parentName: 'Camila Souza', contact: '(11) 94444-3333', status: LeadStatus.VisitScheduled, interestDate: '2024-06-15', notes: 'Visita agendada para 25/06 às 10h.', tasks: confirmVisitTask, isConverted: false, requiredDocuments: defaultRequiredDocs, communicationLog: [] },
    { id: 4, name: 'Família Lima', parentName: 'Lucas Lima', contact: '(11) 92222-1111', status: LeadStatus.Enrolled, interestDate: '2024-06-10', notes: 'Matrícula efetuada para a Turma B.', tasks: [], isConverted: false, requiredDocuments: defaultRequiredDocs.map(d => ({...d, status: 'Recebido'})), communicationLog: [] },
    { id: 5, name: 'Família Almeida', parentName: 'Beatriz Almeida', contact: '(11) 91111-0000', status: LeadStatus.Lost, interestDate: '2024-06-05', notes: 'Optou por outra escola mais próxima de casa.', tasks: [], isConverted: false, requiredDocuments: defaultRequiredDocs, communicationLog: [] },
    { id: 6, name: 'Família Gomes', parentName: 'Tiago Gomes', contact: '(11) 99999-0000', status: LeadStatus.New, interestDate: '2024-06-22', notes: 'Solicitou informações por email.', tasks: [defaultTask], isConverted: false, requiredDocuments: defaultRequiredDocs, communicationLog: [] },
];

export const financialSummaryData = [
    { name: 'Jan', revenue: 45000, expenses: 24000 },
    { name: 'Fev', revenue: 48000, expenses: 26000 },
    { name: 'Mar', revenue: 52000, expenses: 25000 },
    { name: 'Abr', revenue: 51000, expenses: 28000 },
    { name: 'Mai', revenue: 53000, expenses: 27000 },
    { name: 'Jun', revenue: 55000, expenses: 30000 },
];

export const mockStaff: Staff[] = [
    { id: 1, name: 'Mariana Lima', role: 'Professor(a)', email: 'mariana.l@school.com', phone: '(11) 91111-2222', hireDate: '2021-02-01', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff1/100/100', cpf: '111.111.111-11', address: 'Rua A, 123' },
    { id: 2, name: 'Pedro Alves', role: 'Coordenador(a)', email: 'pedro.a@school.com', phone: '(11) 93333-4444', hireDate: '2020-08-15', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff2/100/100', cpf: '222.222.222-22', address: 'Rua B, 456' },
    { id: 3, name: 'Carla Andrade', role: 'Secretário(a)', email: 'carla.a@school.com', phone: '(11) 95555-6666', hireDate: '2022-01-10', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/staff3/100/100', cpf: '333.333.333-33', address: 'Rua C, 789' },
    { id: 4, name: 'Roberto Farias', role: 'Diretor(a)', email: 'roberto.f@school.com', phone: '(11) 97777-8888', hireDate: '2018-05-20', status: StaffStatus.Active, avatarUrl: 'https://picsum.photos/seed/user/100/100', cpf: '444.444.444-44', address: 'Rua D, 101' },
    { id: 5, name: 'Sonia Braga', role: 'Professor(a)', email: 'sonia.b@school.com', phone: '(11) 98888-9999', hireDate: '2023-08-01', status: StaffStatus.Inactive, avatarUrl: 'https://picsum.photos/seed/staff5/100/100', cpf: '555.555.555-55', address: 'Rua E, 212' },
];

export const mockUsers: User[] = [
    { id: 1, name: 'Diretor Admin', email: 'diretor@school.com', role: 'Admin', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user/100/100' },
    { id: 2, name: 'Secretaria Joana', email: 'joana.s@school.com', role: 'Secretário(a)', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user2/100/100' },
    { id: 3, name: 'Coordenação Pedro', email: 'pedro.c@school.com', role: 'Coordenador(a)', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user3/100/100' },
    { id: 4, name: 'Usuário Inativo', email: 'inativo@school.com', role: 'Secretário(a)', status: UserStatus.Inactive, avatarUrl: 'https://picsum.photos/seed/user4/100/100' },
    { id: 5, name: 'João Silva', email: 'joao.silva@email.com', role: 'Pai/Responsável', status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/user5/100/100', studentId: 1 },
];

export const mockCommunications: Communication[] = [
    { id: 1, title: 'Reunião de Pais e Mestres', content: 'Prezados pais e responsáveis, gostaríamos de convidá-los para a nossa reunião trimestral de pais e mestres, que ocorrerá no dia 30 de Julho.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-15' },
    { id: 2, title: 'Festa Junina', content: 'A nossa tradicional Festa Junina será no próximo sábado, dia 29 de Junho! Contamos com a presença de todos para uma tarde de muita diversão.', recipientGroup: 'Todos os Pais', sentDate: '2024-06-10' },
    { id: 3, title: 'Atualização do Calendário', content: 'Informamos que o dia 15 de Agosto será feriado escolar. Não haverá aula neste dia.', recipientGroup: 'Todos', sentDate: '2024-06-05' },
];

export const mockAgendaItems: AgendaItem[] = [
    { id: 1, date: '2024-07-25', title: 'Reunião de Pais - Turma C', description: 'Discussão sobre o progresso do semestre e apresentação dos projetos.', type: AgendaItemType.Event, classTarget: 'Turma C', isSent: true },
    { id: 2, date: '2024-08-10', title: 'Feira de Ciências', description: 'Apresentação dos projetos dos alunos do Ensino Fundamental. Aberto aos pais.', type: AgendaItemType.Event, classTarget: 'Todas as Turmas', isSent: false },
    { id: 3, date: '2024-07-18', title: 'Pesquisa sobre a Revolução Industrial', description: 'Entregar pesquisa impressa com no mínimo 3 páginas sobre os impactos da Revolução Industrial.', type: AgendaItemType.Homework, classTarget: 'Turma B', isSent: true },
    { id: 4, date: '2024-07-18', title: 'Resumo do Dia - Turma A', description: 'Hoje aprendemos sobre o ciclo da água e fizemos uma experiência em sala. O lanche foi maçã e suco de uva.', type: AgendaItemType.DailySummary, classTarget: 'Turma A', isSent: true },
    { id: 5, date: '2024-07-20', title: 'Pagamento da Mensalidade', description: 'Lembramos que o vencimento da mensalidade de Agosto é no dia 05.', type: AgendaItemType.Reminder, classTarget: 'Todas as Turmas', isSent: false },
];

export const mockLibraryBooks: LibraryBook[] = [
    { id: 1, title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-8582850308', status: 'Disponível' },
    { id: 2, title: 'A Menina que Roubava Livros', author: 'Markus Zusak', isbn: '978-8598078275', status: 'Emprestado', borrowedBy: { studentId: 1, studentName: 'Ana Silva'}, dueDate: '2024-08-15' },
    { id: 3, title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', isbn: '978-8532530278', status: 'Disponível' },
    { id: 4, title: 'O Diário de Anne Frank', author: 'Anne Frank', isbn: '978-8501044457', status: 'Disponível' },
    { id: 5, title: 'Capitães da Areia', author: 'Jorge Amado', isbn: '978-8535914104', status: 'Emprestado', borrowedBy: { studentId: 4, studentName: 'Daniela Souza'}, dueDate: '2024-08-20' },
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