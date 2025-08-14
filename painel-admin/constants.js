/**
 * @fileoverview Contém as constantes globais e imutáveis do Painel de Solicitações de Certificados de Conclusão de curso.
 * Este é um módulo de aplicação do LearningFly.
 * Estes valores são parte do código-fonte e não devem mudar entre diferentes ambientes ou clientes.
 * A estrutura foi faz uso de uma função para garantir a disponibilidade no escopo global do Apps Script, viabilizando a importação em outros arquivos e o reaproveitamento do código.
 */

function Constants() {
  return {
    SHEET_NAMES: {
      SOLICITACOES: 'solicitacoes',
      CURSOS: 'cursos',
      HISTORICOS_CURSOS: 'historicos.cursos',
      TEMPLATE_EXPORT_CERTIFICADO: 'template',
      DECLARACOES_MATRICULA: 'declaracoes_matricula',
      DECLARACOES_CONCLUSAO: 'declaracoes_conclusao',
    },

    HEADERS: {
      SOLICITACOES: [
        'protocolo', 'timestamp', 'nome', 'cpf', 'rg', 'ufRG', 'dataNascimento', 'nacionalidade', 'genero', 'email', 'telefone', 'instituicao', 'curso', 'inicioCurso', 'optouTCC', 'modalidadeEnvio', 'idTransacao', 'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'status', 'observacoes',
      ],

      CURSOS: [
        'id_curso', 'nome_curso_simples', 'nome_curso_completo', 'status', 'turma', 'data_publicacao', 'tipo', 'instituicao', 'categoria', 'link_e_mec', 'tipo_doc', 'n_doc', 'ano_doc', 'ch', 'inicio', 'area_conhecimento', 'coordenador', 'pasta_curso', 'plano_ensino', 'produtor_conteudo', 'pag_venda', 'homologado_parceiro', 'disc-1', 'ch-d1', 'prd-d1', 'disc-2', 'ch-d2', 'prd-d2', 'disc-3', 'ch-d3', 'prd-d3', 'disc-4', 'ch-d4', 'prd-d4', 'disc-5', 'ch-d5', 'prd-d5', 'disc-6', 'ch-d6', 'prd-d6', 'disc-7', 'ch-d7', 'prd-d7', 'disc-8', 'ch-d8', 'prd-d8', 'disc-9', 'ch-d9', 'prd-d9', 'disc-10', 'ch-d10', 'prd-10', 'disc-11', 'ch-d11', 'prd-11', 'disc-12', 'ch-d12', 'prd-12', 'disc-13', 'ch-d13', 'prd-13', 'disc-14', 'ch-d14', 'prd-14', 'disc-15', 'ch-d15', 'prd-15', 'disc-16', 'ch-d16', 'prd-16',
        'disc-17', 'ch-d17', 'prd-17'
      ],

      DECLARACOES_MATRICULA_INSTITUICAO_1: [
        'Nome Completo', 'CPF', 'E-mail', 'Número de Matrícula', 'Nome do Curso', 'Data de Início', 'Data de Conclusão', 'Carga horária', 'Área de conhecimento', 'Emissão', 'Gerador', 'Envio por Email', 'ID DOC', 'CodigoAleatorio'

      ],
      DECLARACOES_MATRICULA_INSTITUICAO_2: [
        'Nome Completo', 'CPF', 'E-mail', 'Número de Matrícula', 'Nome do Curso', 'Data de Início', 'Data de Conclusão', 'Carga horária', 'Área de conhecimento', 'Emissão', 'Gerador', 'Envio por Email', 'ID DOC', 'CodigoAleatorio'

      ],
      DECLARACOES_CONCLUSAO_INSTITUICAO_1: [
        'Nome Completo', 'CPF', 'E-mail', 'Número de Matrícula', 'Nome do Curso', 'Data de Início', 'Data de Conclusão', 'Carga horária', 'Área de conhecimento', 'Emissão', 'Gerador', 'Envio por Email', 'ID DOC', 'CodigoAleatorio'
      ],

      DECLARACOES_CONCLUSAO_INSTITUICAO_2: [
        'Nome Completo', 'CPF', 'E-mail', 'Número de Matrícula', 'Nome do Curso', 'Data de Início', 'Data de Conclusão', 'Carga horária', 'Área de conhecimento', 'Emissão', 'Gerador', 'Envio por Email', 'ID DOC', 'CodigoAleatorio'
      ],

      HISTORICOS_CURSOS: [
        'id_curso', 'curso', 'instituicao', 'disciplina', 'carga_horaria', 'professor', 'titulacao'
      ],

      TEMPLATE_EXPORT_CERTIFICADO: [
        'cnpj_instituicao', 'data_emissao', 'nacionalidade', 'genero', 'nome_aluno', 'data_nascimento', 'cpf', 'rg', 'rg_uf', 'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'email', 'celular', 'titulo_curso', 'tipo_curso', 'carga_horaria', 'area_conhecimento', 'nome_turma',
        'inicio', 'termino', 'registro', 'pagina', 'livro', 'titulo', 'tcc_tipo', 'tcc_titulo', 'tcc_ch', 'tcc_nota', 'tcc_professor', 'tcc_titulacao', 'disciplina_01_nome', 'disciplina_01_ch', 'disciplina_01_nota', 'disciplina_01_professor', 'disciplina_01_titulacao', 'disciplina_01_palestrante', 'disciplina_02_nome', 'disciplina_02_ch', 'disciplina_02_nota', 'disciplina_02_professor', 'disciplina_02_titulacao', 'disciplina_02_palestrante', 'disciplina_03_nome', 'disciplina_03_ch', 'disciplina_03_nota',
        'disciplina_03_professor', 'disciplina_03_titulacao', 'disciplina_03_palestrante', 'disciplina_04_nome', 'disciplina_04_ch', 'disciplina_04_nota', 'disciplina_04_professor', 'disciplina_04_titulacao', 'disciplina_04_palestrante', 'disciplina_05_nome', 'disciplina_05_ch', 'disciplina_05_nota', 'disciplina_05_professor', 'disciplina_05_titulacao', 'disciplina_05_palestrante', 'disciplina_06_nome', 'disciplina_06_ch', 'disciplina_06_nota',
        'disciplina_06_professor', 'disciplina_06_titulacao', 'disciplina_06_palestrante', 'disciplina_07_nome', 'disciplina_07_ch', 'disciplina_07_nota', 'disciplina_07_professor', 'disciplina_07_titulacao', 'disciplina_07_palestrante', 'disciplina_08_nome', 'disciplina_08_ch', 'disciplina_08_nota', 'disciplina_08_professor', 'disciplina_08_titulacao', 'disciplina_08_palestrante', 'disciplina_09_nome', 'disciplina_09_ch', 'disciplina_09_nota', 'disciplina_09_professor', 'disciplina_09_titulacao', 'disciplina_09_palestrante', 'disciplina_10_nome', 'disciplina_10_ch', 'disciplina_10_nota', 'disciplina_10_professor', 'disciplina_10_titulacao', 'disciplina_10_palestrante', 'disciplina_11_nome', 'disciplina_11_ch', 'disciplina_11_nota', 'disciplina_11_professor', 'disciplina_11_titulacao', 'disciplina_11_palestrante', 'disciplina_12_nome', 'disciplina_12_ch', 'disciplina_12_nota', 'disciplina_12_professor', 'disciplina_12_titulacao', 'disciplina_12_palestrante', 'disciplina_13_nome', 'disciplina_13_ch', 'disciplina_13_nota', 'disciplina_13_professor', 'disciplina_13_titulacao', 'disciplina_13_palestrante', 'disciplina_14_nome', 'disciplina_14_ch', 'disciplina_14_nota', 'disciplina_14_professor', 'disciplina_14_titulacao', 'disciplina_14_palestrante', 'disciplina_15_nome', 'disciplina_15_ch', 'disciplina_15_nota', 'disciplina_15_professor', 'disciplina_15_titulacao', 'disciplina_15_palestrante', 'disciplina_16_nome', 'disciplina_16_ch', 'disciplina_16_nota', 'disciplina_16_professor', 'disciplina_16_titulacao', 'disciplina_16_palestrante', 'disciplina_17_nome', 'disciplina_17_ch', 'disciplina_17_nota', 'disciplina_17_professor', 'disciplina_17_titulacao', 'disciplina_17_palestrante', 'disciplina_18_nome', 'disciplina_18_ch', 'disciplina_18_nota', 'disciplina_18_professor', 'disciplina_18_titulacao', 'disciplina_18_palestrante', 'disciplina_19_nome', 'disciplina_19_ch', 'disciplina_19_nota', 'disciplina_19_professor', 'disciplina_19_titulacao', 'disciplina_19_palestrante', 'disciplina_20_nome', 'disciplina_20_ch', 'disciplina_20_nota', 'disciplina_20_professor', 'disciplina_20_titulacao', 'disciplina_20_palestrante'
      ]
    },
    CONFIG_INSTITUICOES: {
      "Instituição 1": {
        spreadsheetId: Config.SHEETS.SPREADSHEET_ID_DECLARACOES_INSTITUICAO_1,
        sheet_name_matriculas: 'matriculas_alunos_instituicao_1',
        declaracoes_matricula: 'declaracoes_matricula',
        declaracoes_conclusao: 'declaracoes_conclusao',
        apiUrl: "https://link.da.sua.api/institutions/96532073000101/users/",
        importacao: {
          matriculas: { queryId: "insira o id aqui", apiKey: "insira a sua chave aqui" },
          ras: { queryId: "insira o id aqui", apiKey: "insira a sua chave aqui" },
        },
        folder_id_matricula: 'id da pasta de matrícula',
        folder_id_conclusao: 'id da pasta de conclusão',
        email_alias: 'emaildasuainstituicao@exemplo.com.br',
        assunto_decla_matricula: "Nome da Instituição 1 - Declaração de Matrícula",
        corpo_decla_matricula: "Prezado(a) [Nome],\n\nSegue em anexo a declaração de matrícula conforme solicitado.",
        assunto_decla_conclusao: "Nome da Instituição 1 - Declaração de Conclusão",
        corpo_decla_conclusao: "Prezado(a) [Nome],\n\nSegue em anexo a declaração de conclusão conforme solicitado."
      },

      "Instituição 2": {
        spreadsheetId: Config.SHEETS.SPREADSHEET_ID_DECLARACOES_INSTITUICAO_2,
        sheet_name_matriculas: 'matriculas_alunos_instituicao_2',
        declaracoes_matricula: 'declaracoes.matricula',
        declaracoes_conclusao: 'declaracoes.conclusao',
        apiUrl: "https://link.da.sua.api/institutions/96532073000101/users/",
        importacao: {
          matriculas: { queryId: "insira o id aqui", apiKey: "insira a sua chave aqui" },
          ras: { queryId: "insira o id aqui", apiKey: "insira a sua chave aqui" },
        },
        folder_id_matricula: 'id da pasta de matrícula',
        folder_id_conclusao: 'id da pasta de conclusão',
        email_alias: 'emaildasuainstituicao@exemplo.com.br',
        assunto_decla_matricula: "Nome da Instituição 2 - Declaração de Matrícula",
        corpo_decla_matricula: "Prezado(a) [Nome],\n\nSegue em anexo a declaração de matrícula conforme solicitado.",
        assunto_decla_conclusao: "Nome da Instituição 2 - Declaração de Conclusão",
        corpo_decla_conclusao: "Prezado(a) [Nome],\n\nSegue em anexo a declaração de conclusão conforme solicitado."
      }
    },
  };
}