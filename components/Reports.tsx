
import React from 'react';
import Card from './common/Card';
import { useData } from '../contexts/DataContext';
// FIX: Corrected import path for types.
import { StudentStatus, PaymentStatus, LeadStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ResponsiveValue } from 'recharts';

// A simple stat card component local to this view
const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-center">
        <h4 className="text-sm font-medium text-brand-text-light">{title}</h4>
        <p className="text-2xl font-bold text-brand-text-dark">{value}</p>
    </div>
);


const Reports: React.FC = () => {
    const { students, invoices, leads, loading } = useData();

    if (loading) {
        return (
             <div className="flex justify-center items-center h-64">
                <p className="text-brand-text">Carregando relatórios...</p>
            </div>
        );
    }

    // --- Student Data Processing ---
    const studentsByStatus = students.reduce((acc, student) => {
        const status = student.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<StudentStatus, number>);
    
    const studentStatusData = Object.entries(studentsByStatus).map(([name, value]) => ({ name, value }));
    const studentStatusColors = {
        [StudentStatus.Active]: '#22c55e', // green-500
        [StudentStatus.Inactive]: '#ef4444', // red-500
        [StudentStatus.Graduated]: '#64748b', // slate-500
    };

    const studentsByClass = students.reduce((acc, student) => {
        if(student.status === StudentStatus.Active) {
            acc[student.class] = (acc[student.class] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const studentClassData = Object.entries(studentsByClass).map(([name, value]) => ({ name, Alunos: value }));


    // --- Financial Data Processing ---
    const financialsByStatus = invoices.reduce((acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + invoice.amount;
        return acc;
    }, {} as Record<PaymentStatus, number>);

    const financialStatusData = [
        { name: 'Pago', Valor: financialsByStatus[PaymentStatus.Paid] || 0 },
        { name: 'Pendente', Valor: financialsByStatus[PaymentStatus.Pending] || 0 },
        { name: 'Atrasado', Valor: financialsByStatus[PaymentStatus.Overdue] || 0 },
    ];
    const financialStatusColors = {
        'Pago': '#22c55e',
        'Pendente': '#f59e0b',
        'Atrasado': '#ef4444',
    };
    
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReceived = financialsByStatus[PaymentStatus.Paid] || 0;
    const totalPending = (financialsByStatus[PaymentStatus.Pending] || 0) + (financialsByStatus[PaymentStatus.Overdue] || 0);

    // --- Leads Data Processing ---
    const totalLeads = leads.length;
    const enrolledLeads = leads.filter(l => l.status === LeadStatus.Enrolled).length;
    const conversionRate = totalLeads > 0 ? ((enrolledLeads / totalLeads) * 100).toFixed(1) + '%' : '0%';
    const leadsByStatus = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {} as Record<LeadStatus, number>);
    const leadStatusData = Object.entries(leadsByStatus).map(([name, value]) => ({ name, Leads: value }));


    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark">Relatório de Alunos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold text-center mb-2">Alunos por Status</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={studentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                     {studentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={studentStatusColors[entry.name as StudentStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-center mb-2">Alunos Ativos por Turma</h3>
                         <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={studentClassData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip />
                                <Bar dataKey="Alunos" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark">Relatório Financeiro</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Faturado" value={totalBilled.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <StatCard title="Total Recebido" value={totalReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <StatCard title="Pendente / Atrasado" value={totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                </div>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/>
                        <Bar dataKey="Valor">
                             {financialStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={financialStatusColors[entry.name as keyof typeof financialStatusColors]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-brand-text-dark">Relatório de Admissões</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <StatCard title="Total de Leads" value={totalLeads.toString()} />
                    <StatCard title="Taxa de Conversão" value={conversionRate} />
                </div>
                <h3 className="font-semibold text-center mb-2">Leads por Etapa do Funil</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={leadStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20 as ResponsiveValue<number>} textAnchor="end" height={50 as ResponsiveValue<number>} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Leads" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Reports;
