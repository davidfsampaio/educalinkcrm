
import React from 'react';
import Card from './common/Card';
import { useData } from '../contexts/DataContext';
// FIX: Corrected import path for types.
import { StudentStatus, LeadStatus, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; color?: string }> = ({ title, value, color = 'text-brand-primary' }) => (
    <Card>
        <h3 className="text-lg font-semibold text-brand-text-dark truncate">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </Card>
);

const Dashboard: React.FC = () => {
    const { students, leads, invoices, staff, financialSummary, loading } = useData();

    if (loading) {
        return <div>Carregando...</div>
    }

    const activeStudents = students.filter(s => s.status === StudentStatus.Active).length;
    const newLeads = leads.filter(l => l.status === LeadStatus.New).length;
    const overdueInvoices = invoices.filter(i => i.status === PaymentStatus.Overdue).length;
    
    const leadsByStatus = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {} as Record<LeadStatus, number>);

    const leadPieData = Object.entries(leadsByStatus).map(([name, value]) => ({ name, value }));
    const leadPieColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Alunos Ativos" value={activeStudents} />
                <StatCard title="Novos Leads" value={newLeads} />
                <StatCard title="Cobranças Atrasadas" value={overdueInvoices} color="text-red-500" />
                <StatCard title="Total de Funcionários" value={staff.length} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                     <h3 className="text-xl font-bold mb-4 text-brand-text-dark">Desempenho Financeiro</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialSummary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#0ea5e9" name="Receita" />
                            <Bar dataKey="expenses" fill="#f43f5e" name="Despesas" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-bold mb-4 text-brand-text-dark">Funil de Admissões</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={leadPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {leadPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={leadPieColors[index % leadPieColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
