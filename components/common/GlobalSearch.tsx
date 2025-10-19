import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { Student, Staff } from '../../types';

type SearchResult = (Student & { type: 'student' }) | (Staff & { type: 'staff' });

interface GlobalSearchProps {
    onSelect: (item: Student | Staff) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelect }) => {
    const { students, staff } = useData();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const lowerCaseQuery = query.toLowerCase();

            const studentResults = students
                .filter(s =>
                    s.name.toLowerCase().includes(lowerCaseQuery) ||
                    s.parent_name.toLowerCase().includes(lowerCaseQuery)
                )
                .map(s => ({ ...s, type: 'student' as const }));

            const staffResults = staff
                .filter(st => st.name.toLowerCase().includes(lowerCaseQuery))
                .map(st => ({ ...st, type: 'staff' as const }));

            setResults([...studentResults, ...staffResults]);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, students, staff]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: SearchResult) => {
        const { type, ...data } = item;
        onSelect(data as Student | Staff);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                    type="text"
                    placeholder="Buscar alunos, pais ou funcionários..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full md:w-64 lg:w-96 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
            </div>
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full md:w-96 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                    <ul>
                        {results.map((item, index) => (
                            <li key={`${item.type}-${item.id}-${index}`} onClick={() => handleSelect(item)} className="px-4 py-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0">
                                <p className="font-semibold text-brand-text-dark">{item.name}</p>
                                {item.type === 'student' && <p className="text-sm text-brand-text-light">Aluno(a) - Turma: {item.class} (Responsável: {item.parent_name})</p>}
                                {item.type === 'staff' && <p className="text-sm text-brand-text-light">Funcionário(a) - Cargo: {item.role}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;