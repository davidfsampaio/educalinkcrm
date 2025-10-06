import { Settings } from '../types';
import { mockTuitionPlans } from './mockData';
import { initialRoles } from './permissionsData';

export const defaultSettings: Settings = {
    schoolInfo: {
        name: 'Escola Modelo Aprender',
        address: 'Rua do Saber, 123 - Bairro da Educação, Cidade do Conhecimento',
        phone: '(11) 4002-8922',
        email: 'contato@escolamodelo.com',
        logoUrl: 'https://picsum.photos/seed/schoollogo/200/80',
        cnpj: '12.345.678/0001-99',
    },
    classes: [
        'Turma A',
        'Turma B',
        'Turma C',
    ],
    staffRoles: [
        'Professor(a)',
        'Coordenador(a)',
        'Secretário(a)',
        'Diretor(a)',
        'Auxiliar de Classe',
        'Psicólogo(a)',
    ],
    tuitionPlans: mockTuitionPlans,
    roles: initialRoles,
    declarationTemplates: {
        enrollment: `DECLARAÇÃO DE MATRÍCULA

Declaramos, для os devidos fins, que o(a) aluno(a) {{student.name}}, filho(a) de {{student.parentName}}, portador(a) do CPF nº {{student.cpf}}, encontra-se regularmente matriculado(a) nesta instituição de ensino, {{schoolInfo.name}}, sob o CNPJ nº {{schoolInfo.cnpj}}, no ano letivo de {{currentYear}}, cursando a {{student.class}}.`,

        completion: `DECLARAÇÃO DE CONCLUSÃO

Declaramos, para os devidos fins, que o(a) aluno(a) {{student.name}}, filho(a) de {{student.parentName}}, concluiu com aproveitamento a {{student.class}} no ano letivo de {{previousYear}}, encontrando-se apto(a) a prosseguir para a série/ciclo seguinte.`,
        
        transfer: `DECLARAÇÃO DE TRANSFERÊNCIA

Declaramos, para fins de transferência, que o(a) aluno(a) {{student.name}}, filho(a) de {{student.parentName}}, esteve regularmente matriculado(a) nesta instituição de ensino, {{schoolInfo.name}}, até a presente data, na {{student.class}}.

Informamos que sua transferência foi solicitada e que sua situação acadêmica e financeira encontra-se regular junto a esta secretaria.`,

        tax: `DECLARAÇÃO PARA FINS DE IMPOSTO DE RENDA

Declaramos, para fins de comprovação junto à Receita Federal, que o(a) Sr(a). {{student.parentName}}, inscrito(a) no CPF sob o nº {{student.cpf}}, efetuou pagamentos a esta instituição de ensino, {{schoolInfo.name}}, inscrita no CNPJ sob o nº {{schoolInfo.cnpj}}, referentes aos serviços educacionais prestados ao(à) aluno(a) {{student.name}} durante o ano-calendário de {{previousYear}}.`,
        
        clearance: `DECLARAÇÃO DE QUITAÇÃO DE DÉBITOS

Declaramos, para os devidos fins, que o(a) Sr(a). {{student.parentName}}, responsável financeiro pelo(a) aluno(a) {{student.name}}, portador(a) do CPF nº {{student.cpf}}, encontra-se em situação de adimplência com todas as suas obrigações financeiras junto a esta instituição de ensino, {{schoolInfo.name}}, até a presente data.`,
    }
};