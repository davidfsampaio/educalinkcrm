import React from 'react';
import Card from './Card';

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);


const AccessDenied: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="max-w-md text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <LockIcon className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-brand-text-dark">Acesso Negado</h2>
                <p className="mt-2 text-brand-text">
                    Você não tem permissão para visualizar esta página.
                </p>
                <p className="mt-1 text-sm text-brand-text-light">
                    Por favor, entre em contato com o administrador do sistema se você acredita que isso é um erro.
                </p>
            </Card>
        </div>
    );
};

export default AccessDenied;
