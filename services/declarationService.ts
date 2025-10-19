import { Student, Settings, DeclarationType } from '../types';

export const generateDeclaration = (student: Student, type: DeclarationType, settings: Settings): string => {
    const template = settings?.declarationTemplates?.[type];
    const schoolInfo = settings?.schoolInfo;

    if (!template || !schoolInfo) {
        return "Erro: Modelo de declaração ou informações da escola não encontradas.";
    }

    const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    let processedText = template;
    const replacements: Record<string, string> = {
        '{{student.name}}': student.name,
        '{{student.parentName}}': student.parentName,
        '{{student.cpf}}': student.cpf,
        '{{student.class}}': student.class,
        '{{schoolInfo.name}}': schoolInfo.name,
        '{{schoolInfo.cnpj}}': schoolInfo.cnpj,
        '{{currentDate}}': currentDate,
        '{{currentYear}}': String(currentYear),
        '{{previousYear}}': String(previousYear),
    };

    for (const placeholder in replacements) {
        processedText = processedText.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
    }

    return processedText;
};