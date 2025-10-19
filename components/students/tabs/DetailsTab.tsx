

import React from 'react';
// FIX: Corrected import path for types.
import { Student } from '../../../types';

interface DetailsTabProps {
    student: Student;
}

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-brand-text-dark">{label}</dt>
        <dd className="mt-1 text-sm text-brand-text-dark">{value || '-'}</dd>
    </div>
);

const DetailsTab: React.FC<DetailsTabProps> = ({ student }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-text-dark">Informações Pessoais</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <DetailItem label="Nome Completo" value={student.name} />
                <DetailItem label="Turma" value={student.class} />
                <DetailItem label="Data de Matrícula" value={student.enrollment_date} />
                <DetailItem label="CPF" value={student.cpf} />
                <DetailItem label="Endereço" value={student.address} />
            </dl>
            <h3 className="text-lg font-bold text-brand-text-dark pt-4 border-t">Informações de Contato</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                 <DetailItem label="Nome do Responsável" value={student.parentName} />
                 <DetailItem label="Email do Responsável" value={student.email} />
                 <DetailItem label="Telefone do Responsável" value={student.phone} />
            </dl>
            {student.medicalNotes && (
                 <>
                    <h3 className="text-lg font-bold text-brand-text-dark pt-4 border-t">Observações Médicas</h3>
                    <div className="text-sm text-brand-text-dark bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        {student.medicalNotes}
                    </div>
                 </>
            )}
        </div>
    );
};

export default DetailsTab;