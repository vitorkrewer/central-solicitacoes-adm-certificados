// CONFIGURAÇÕES GERAIS
/**
 * @fileoverview Contém as configurações de ambiente da aplicação do Painel de Solicitações do LearningFly e seus respectivos módulos.
 * Cada implantação (desenvolvimento, produção, cliente X) terá sua própria versão deste arquivo.
 */

const Config = {
  SHEETS: {
    // ID da planilha que opera como Banco de Dados de Solicitações.
    ID_SOLICITACOES: 'Insira o ID da sua planilha aqui',

    // ID da planilha de gerenciamento dos cursos.
    ID_CURSOS: 'Insira o ID da sua planilha aqui',

    // ID da planilha modelo para exportação de certificados.
    ID_TEMPLATE_EXPORT_CERTIFICADO: 'Insira o ID da sua planilha aqui',

    // ID da planilha de armazenamento de dados das declarações.
    ID_DECLARACOES_INSTITUICAO_1: 'Insira o ID da sua planilha aqui',

    ID_DECLARACOES_INSTITUICAO_1: 'Insira o ID da sua planilha aqui',
  },

  DOCS: {
    // Modelo de documento Google Docs para geração das declarações de matrícula e conclusão de curso.
    TEMPLATE_DECLARACAO_CONCLUSAO_ID: 'Insira o ID do Template aqui',

    TEMPLATE_DECLARACAO_MATRICULA_ID: 'Insira o ID do Template aqui',
  },
  
  DRIVE: {
    // Pasta raiz onde os arquivos de certificados serão armazenados.
    ROOT_CERTIFICADOS_EXPORT_FOLDER_ID: 'Insira o ID do Pasta do Google Drive aqui',
  },

    INSTITUICOES: {
      "Instituição 1": "Cnpj da instituição 1 - somente números",
      "Instituição 2": "Cnpj da instituição 2 - somente números",
    }
};