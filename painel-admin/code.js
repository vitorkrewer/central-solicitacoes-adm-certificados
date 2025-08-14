/**
 * Converte qualquer valor para string segura (sem undefined, null, objetos, etc.)
 * @param {*} value 
 * @returns {string}
 */
function safeString(value) {
  return (value !== undefined && value !== null) ? String(value).trim() : '';
}

// =================== FUNÇÃO PRINCIPAL (ROTEAMENTO) ===================
function doGet(e) {
  return HtmlService.createTemplateFromFile('admin.ui')
    .evaluate()
    .setTitle('Painel de Administração')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =================== LÓGICA DE AUTENTICAÇÃO ===================

/**
 * @description Verifica o usuário e a chave e, se corretos, gera um token de sessão.
 * @param {string} username - O nome de usuário inserido.
 * @param {string} clientKey - A chave inserida.
 * @returns {object} Um objeto com o status do sucesso e o token, se aplicável.
 */
function authenticate(username, clientKey) {
  const usersJSON = PropertiesService.getScriptProperties().getProperty('USER_KEYS');

  if (!usersJSON) {
    throw new Error("As chaves de usuário ainda não foram configuradas. Rode a função 'setupUserKeys' no editor.");
  }

  const users = JSON.parse(usersJSON);
  const foundUser = users.find(u => u.user === username);

  if (foundUser && foundUser.key === clientKey) {
    const token = Utilities.getUuid();
    // Armazena o token em cache por 6 horas, associado ao nome de usuário.
    CacheService.getScriptCache().put(token, username, 21600);
    Logger.log(`Autenticação bem-sucedida para o usuário '${username}'. Token gerado.`);
    return { success: true, token: token };
  } else {
    Logger.log(`Tentativa de autenticação falhou para o usuário '${username}'.`);
    return { success: false };
  }
}

/**
 * @description Função auxiliar para validar um token de sessão.
 * @param {string} token - O token de sessão a ser validado.
 * @returns {boolean} Verdadeiro se o token for válido.
 */
function isTokenValid(token) {
  if (!token) return false;
  const isValid = CacheService.getScriptCache().get(token) !== null;
  if (!isValid) {
    Logger.log('Token inválido ou expirado: ' + token);
  }
  return isValid;
}

// =================== FUNÇÃO DE MAPEAMENTO DE CABEÇALHOS ===================
/**
 * @description Cria um mapa de cabeçalhos para índices de coluna, normalizando os nomes.
 * @param {Sheet} sheet - O objeto da aba da folha de cálculo.
 * @returns {Object} Um objeto onde a chave é o nome do cabeçalho normalizado e o valor é o índice.
 */
function getHeadersMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headersMap = {};
  headers.forEach((header, index) => {
    if (header && typeof header === 'string') {
      const normalizedHeader = header
        .normalize("NFD")                       // Remove acentos
        .replace(/[\u0300-\u036f]/g, "")       // Remove marcas diacríticas
        .replace(/\s+/g, '')                   // Remove espaços
        .replace(/[^a-zA-Z0-9]/g, '')          // Remove caracteres especiais
        .toLowerCase();
      headersMap[normalizedHeader] = index;
    }
  });
  return headersMap;
}


// =================== FUNÇÕES PARA O PAINEL DE ADMINISTRAÇÃO ===================
/**
 * @description Busca e mapeia as solicitações para um formato limpo e consistente (camelCase).
 */
function getSolicitacoes(token) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada. Por favor, faça o login novamente.");
  try {
    const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_SOLICITACOES).getSheetByName(Constants().SHEET_NAMES.SOLICITACOES);
    if (!sheet) throw new Error(`A aba "${Constants().SHEET_NAMES.SOLICITACOES}" não foi encontrada.`);
    if (sheet.getLastRow() <= 1) return [];

    const headersMap = getHeadersMap(sheet);
    Logger.log("HeadersMap: " + JSON.stringify(headersMap));

    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    const values = dataRange.getValues();

    const solicitacoes = values.map(row => {
      const getValue = (headerName) => {
        const normalized = headerName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase();

        const index = headersMap[normalized];
        return index !== undefined ? row[index] : '';
      };

      return {
        protocolo: safeString(getValue('Protocolo')),
        timestamp: safeString(getValue('Timestamp')),
        nomeCompleto: safeString(getValue('Nome')),
        cpf: safeString(getValue('CPF')),
        rg: safeString(getValue('RG')),
        ufRG: safeString(getValue('ufRG')),
        dataNascimento: safeString(getValue('DataNascimento')),
        nacionalidade: safeString(getValue('Nacionalidade')),
        genero: safeString(getValue('Genero')),
        email: safeString(getValue('Email')),
        telefone: safeString(getValue('Telefone')),
        instituicao: safeString(getValue('Instituicao')),
        nomeDoCurso: safeString(getValue('Curso')),
        inicioDoCurso: safeString(getValue('InicioCurso')),
        optouTCC: safeString(getValue('OptouTCC')),
        modalidadeEnvio: safeString(getValue('ModalidadeEnvio')),
        idTransacao: safeString(getValue('IDTransacao')),
        cep: safeString(getValue('cep')),
        endereco: safeString(getValue('Endereco')),
        numero: safeString(getValue('Numero')),
        complemento: safeString(getValue('Complemento')),
        bairro: safeString(getValue('Bairro')),
        cidade: safeString(getValue('Cidade')),
        uf: safeString(getValue('UF')),
        status: safeString(getValue('Status')),
        observacoes: safeString(getValue('Observacoes'))
      };

    }).reverse();

    Logger.log('Solicitações prontas: ' + JSON.stringify(solicitacoes));
    return solicitacoes;

  } catch (error) {
    console.error("Erro detalhado em getSolicitacoes: " + error.stack);
    throw new Error("Não foi possível buscar os dados. Verifique se os cabeçalhos essenciais existem na folha de cálculo.");
  }
}


/**
 * @description Atualiza o status de uma solicitação na folha de cálculo.
 */
function atualizarStatus(token, protocolo, novoStatus) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada. Por favor, faça o login novamente.");
  try {
    const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_SOLICITACOES).getSheetByName(Constants().SHEET_NAMES.SOLICITACOES);
    if (!sheet) throw new Error(`A aba "${Constants().SHEET_NAMES.SOLICITACOES}" não foi encontrada.`);

    const headersMap = getHeadersMap(sheet);
    const protocoloColIndex = headersMap["protocolo"];
    const statusColIndex = headersMap["status"];

    if (protocoloColIndex === undefined || statusColIndex === undefined) {
      throw new Error("Colunas 'Protocolo' ou 'Status' não encontradas.");
    }

    const protocoloColumnValues = sheet.getRange(2, protocoloColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    let rowNumber = -1;

    for (let i = 0; i < protocoloColumnValues.length; i++) {
      if (protocoloColumnValues[i][0] == protocolo) {
        rowNumber = i + 2;
        break;
      }
    }

    if (rowNumber !== -1) {
      sheet.getRange(rowNumber, statusColIndex + 1).setValue(novoStatus);
      return `Status do protocolo ${protocolo} atualizado para "${novoStatus}".`;
    } else {
      throw new Error(`Protocolo ${protocolo} não encontrado.`);
    }
  } catch (error) {
    console.error("Erro em atualizarStatus: " + error.stack);
    throw new Error("Falha ao atualizar o status: " + error.message);
  }
}

function atualizarObservacoes(token, protocolo, novasObservacoes) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada. Por favor, faça o login novamente.");
  try {
    const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_SOLICITACOES).getSheetByName(Constants().SHEET_NAMES.SOLICITACOES);
    if (!sheet) throw new Error(`A aba "${Constants().SHEET_NAMES.SOLICITACOES}" não foi encontrada.`);

    const headersMap = getHeadersMap(sheet);
    const protocoloColIndex = headersMap["protocolo"];
    const obsColIndex = headersMap["observacoes"];

    if (protocoloColIndex === undefined || obsColIndex === undefined) {
      throw new Error("Colunas 'Protocolo' ou 'Observações' não encontradas.");
    }

    const protocolos = sheet.getRange(2, protocoloColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    let rowNumber = -1;

    for (let i = 0; i < protocolos.length; i++) {
      if (String(protocolos[i][0]) === String(protocolo)) {
        rowNumber = i + 2;
        break;
      }
    }

    if (rowNumber !== -1) {
      sheet.getRange(rowNumber, obsColIndex + 1).setValue(novasObservacoes);
      return `Observações atualizadas com sucesso para o protocolo ${protocolo}.`;
    } else {
      throw new Error(`Protocolo ${protocolo} não encontrado.`);
    }

  } catch (error) {
    console.error("Erro em atualizarObservacoes: " + error.stack);
    throw new Error("Falha ao atualizar as observações: " + error.message);
  }
}

/**
 * Retorna o objeto de configuração das instituições para o cliente.
 * @param {string} token O token de sessão.
 * @returns {Object} O objeto de instituições com seus CNPJs.
 */
function getInstituicoesConfig(token) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  return Config.INSTITUICOES;
}

/**
 * Busca a lista de instituições únicas da aba de cursos.
 * @param {string} token O token de sessão.
 * @returns {Array<string>} Lista de nomes de instituições.
 */
function getInstituicoes(token) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  try {
    const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_CURSOS).getSheetByName(Constants().SHEET_NAMES.CURSOS);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headersMap = createHeaderMap(headers, Constants().HEADERS.CURSOS);
    const instCol = headersMap['instituicao'];

    if (instCol === undefined) throw new Error("Coluna 'instituicao' não encontrada na aba de cursos.");

    const instituicoesData = sheet.getRange(2, instCol + 1, sheet.getLastRow() - 1, 1).getValues();
    // Usa um Set para obter valores únicos e depois converte para Array
    const instituicoesUnicas = [...new Set(instituicoesData.map(row => row[0]))];

    return instituicoesUnicas.filter(inst => inst); // Remove valores em branco
  } catch (e) {
    Logger.log(`Erro em getInstituicoes: ${e.stack}`);
    throw new Error("Não foi possível buscar a lista de instituições.");
  }
}

/**
 * Busca a lista de cursos, agora podendo filtrar por instituição.
 * @param {string} token O token de sessão.
 * @param {string} [instituicao] - O nome da instituição para filtrar (opcional).
 * @returns {Array<Object>} Lista de cursos com 'id_curso' e 'nome_curso_completo'.
 */
function getPosGraduacaoCursos(token, instituicao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  try {
    const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_CURSOS).getSheetByName(Constants().SHEET_NAMES.CURSOS);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headersMap = createHeaderMap(headers, Constants().HEADERS.CURSOS);

    const idCol = headersMap['idcurso'];
    const nomeCol = headersMap['nomecursocompleto'];
    const instCol = headersMap['instituicao'];

    if (idCol === undefined || nomeCol === undefined || instCol === undefined) {
      throw new Error("Colunas essenciais (id_curso, nome_curso_completo, instituicao) não encontradas.");
    }

    let cursos = data.map(row => ({
      id_curso: row[idCol],
      nome_curso_completo: row[nomeCol],
      instituicao: row[instCol]
    })).filter(c => c.id_curso && c.nome_curso_completo);

    // Se uma instituição foi fornecida, filtra os resultados
    if (instituicao) {
      cursos = cursos.filter(c => c.instituicao === instituicao);
    }

    return cursos;
  } catch (e) {
    Logger.log(`Erro em getPosGraduacaoCursos: ${e.stack}`);
    throw new Error("Não foi possível buscar a lista de cursos.");
  }
}

/**
 * Busca apenas os detalhes e o histórico do curso, sem os alunos.
 * @param {string} token O token de sessão.
 * @param {string} cursoId O ID do curso selecionado.
 * @returns {Object} Um objeto contendo detalhes do curso e o histórico (disciplinas).
 */
function getHistoricoData(token, cursoId) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!cursoId) throw new Error("ID do curso não fornecido.");

  try {
    const cursoDetails = getCursoDetailsById(cursoId);
    const historico = getHistoricoByCursoId(cursoId);

    return { cursoDetails, historico };
  } catch (e) {
    Logger.log(`Erro em getHistoricoData: ${e.stack}`);
    throw new Error(`Falha ao buscar dados do histórico: ${e.message}`);
  }
}

/**
 * Busca alunos concluídos usando a chave composta
 * (nome do curso e instituição) diretamente, como solicitado.
 *
 * @param {string} token O token de sessão.
 * @param {string} nomeCurso O nome completo do curso para filtrar.
 * @param {string} instituicao A instituição para filtrar.
 * @returns {Array<Object>} Lista de alunos concluídos.
 */
function getAlunosPorCurso(token, nomeCurso, instituicao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!nomeCurso || !instituicao) throw new Error("Nome do curso e instituição são obrigatórios.");

  try {
    // Passo 1: Buscar todas as solicitações.
    const allSolicitacoes = getSolicitacoes(token);

    // Passo 2: Filtrar as solicitações usando a chave composta recebida diretamente.
    return allSolicitacoes.filter(solicitacao =>
      solicitacao.nomeDoCurso === nomeCurso &&
      solicitacao.instituicao === instituicao &&
      solicitacao.status === 'Concluído'
    );

  } catch (e) {
    Logger.log(`Erro em getAlunosPorCurso: ${e.stack}`);
    throw new Error(`Falha ao buscar alunos: ${e.message}`);
  }
}

/**
 * Gera uma planilha de template apenas com os dados do curso, sem alunos.
 * @param {string} token O token de sessão.
 * @param {Object} cursoDetails Detalhes do curso.
 * @param {Array<Object>} historico Disciplinas do curso.
 * @returns {string} A URL da nova planilha gerada.
 */
function exportarTemplateHistorico(token, cursoDetails, historico) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!cursoDetails || !historico) {
    throw new Error("Dados do curso insuficientes para exportar o template.");
  }
  // A mágica está aqui: chamamos a função principal com uma lista de alunos vazia.
  return exportarHistorico(token, cursoDetails, historico, []);
}

// =================== FUNÇÃO DE EXPORTAÇÃO ===================

/**
 * GERA E SALVA UMA NOVA PLANILHA COM OS HISTÓRICOS.
 * para cada um dos cabeçalhos definidos em 'TEMPLATE_EXPORT_CERTIFICADO'.
 * @param {string} token O token de sessão.
 * @param {Object} cursoDetails Detalhes completos do curso.
 * @param {Array<Object>} historico Array com as disciplinas do curso.
 * @param {Array<Object>} alunosSelecionados Array com os alunos para exportar. Se vazio, exporta apenas o template.
 * @returns {string} A URL da nova planilha gerada.
 */
function exportarHistorico(token, cursoDetails, historico, alunosSelecionados) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!cursoDetails || !historico || alunosSelecionados === undefined) {
    throw new Error("Dados insuficientes para exportação.");
  }

  try {
    const templateHeaders = Constants().HEADERS.TEMPLATE_EXPORT_CERTIFICADO;
    const exportData = [templateHeaders]; // A primeira linha são sempre os cabeçalhos

    const processRow = (aluno = null) => {
      const row = {};
      const hoje = new Date();

      // =================== DADOS DO ALUNO ===================
      row['nome_aluno'] = aluno ? aluno.nomeCompleto : '';
      row['nacionalidade'] = aluno ? aluno.nacionalidade : '';
      row['genero'] = aluno ? aluno.genero : '';
      row['data_nascimento'] = aluno ? (aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '') : '';
      row['cpf'] = aluno ? aluno.cpf : '';
      row['rg'] = aluno ? aluno.rg : '';
      row['rg_uf'] = aluno ? aluno.ufRG : '';
      row['cep'] = aluno ? aluno.cep : '';
      row['endereco'] = aluno ? aluno.endereco : '';
      row['numero'] = aluno ? aluno.numero : '';
      row['complemento'] = aluno ? aluno.complemento : '';
      row['bairro'] = aluno ? aluno.bairro : '';
      row['cidade'] = aluno ? aluno.cidade : '';
      row['estado'] = aluno ? aluno.uf : '';
      row['email'] = aluno ? aluno.email : '';
      row['celular'] = aluno ? aluno.telefone : '';

      // =================== DADOS DO CURSO E EMISSÃO ===================
      row['cnpj_instituicao'] = Config.INSTITUICOES[cursoDetails.instituicao] || '';
      row['data_emissao'] = hoje.toLocaleDateString('pt-BR');
      row['titulo_curso'] = cursoDetails.nomeCursoCompleto || '';
      row['tipo_curso'] = cursoDetails.tipo || '';
      row['carga_horaria'] = cursoDetails.ch || '';
      row['area_conhecimento'] = cursoDetails.areaconhecimento || '';
      row['nome_turma'] = cursoDetails.turma || '';
      row['inicio'] = cursoDetails.inicio ? new Date(cursoDetails.inicio).toLocaleDateString('pt-BR') : '';
      row['termino'] = '';
      row['registro'] = '';
      row['pagina'] = '';
      row['livro'] = '';
      row['titulo'] = 'Especialista';

      // =================== DADOS DO TCC ===================
      row['tcc_tipo'] = '';
      row['tcc_titulo'] = '';
      row['tcc_ch'] = '';
      row['tcc_nota'] = '';
      row['tcc_professor'] = '';
      row['tcc_titulacao'] = '';

      // =================== DADOS DAS DISCIPLINAS ===================
      historico.forEach((disciplina, index) => {
        if (index < 20) {
          const i = String(index + 1).padStart(2, '0');
          row[`disciplina_${i}_nome`] = disciplina.disciplina || '';
          row[`disciplina_${i}_ch`] = disciplina.cargahoraria || '';
          row[`disciplina_${i}_professor`] = disciplina.professor || '';
          row[`disciplina_${i}_titulacao`] = disciplina.titulacao || '';
          row[`disciplina_${i}_nota`] = '';
          row[`disciplina_${i}_palestrante`] = '';
        }
      });

      const orderedRow = templateHeaders.map(header => row[header] || '');
      return orderedRow;
    };

    if (alunosSelecionados.length === 0) {
      exportData.push(processRow(null));
    } else {
      alunosSelecionados.forEach(aluno => {
        exportData.push(processRow(aluno));
      });
    }

    // =================== CRIAÇÃO DA PLANILHA ===================
    const folder = DriveApp.getFolderById(Config.DRIVE.ROOT_CERTIFICADOS_EXPORT_FOLDER_ID);
    const timestamp = new Date().toLocaleString("pt-BR").replace(/[/:\s]/g, '-');
    const fileName = `Exportacao-Historico - ${cursoDetails.nomeCursoCompleto} - ${timestamp}`; // Também corrigido aqui para o nome do arquivo
    const newSheet = SpreadsheetApp.create(fileName);
    const newSheetFile = DriveApp.getFileById(newSheet.getId());

    newSheetFile.moveTo(folder);

    const targetSheet = newSheet.getSheets()[0];
    targetSheet.getRange(1, 1, exportData.length, templateHeaders.length).setValues(exportData);

    Logger.log(`Planilha de histórico gerada: ${newSheet.getUrl()}`);
    return newSheet.getUrl();

  } catch (e) {
    Logger.log(`Erro em exportarHistorico: ${e.stack}`);
    throw new Error(`Falha ao exportar o histórico: ${e.message}`);
  }
}

// =================== FUNÇÕES AUXILIARES INTERNAS ===================
function getCursoDetailsById(cursoId) {
  const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_CURSOS).getSheetByName(Constants().SHEET_NAMES.CURSOS);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Pega os cabeçalhos originais

  const idColIndex = headers.findIndex(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === 'idcurso');
  if (idColIndex === -1) throw new Error("Coluna 'id_curso' não encontrada.");

  const cursoRow = data.find(row => String(row[idColIndex]) === String(cursoId));

  if (!cursoRow) throw new Error(`Curso com ID '${cursoId}' não encontrado.`);

  // Mapeia a linha encontrada usando os cabeçalhos originais
  return mapRowToObject(cursoRow, headers);
}

function getHistoricoByCursoId(cursoId) {
  const sheet = SpreadsheetApp.openById(Config.SHEETS.ID_CURSOS).getSheetByName(Constants().SHEET_NAMES.HISTORICOS_CURSOS);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const idColIndex = headers.findIndex(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === 'idcurso');
  if (idColIndex === -1) throw new Error("Coluna 'id_curso' não encontrada na aba de históricos.");

  return data
    .filter(row => String(row[idColIndex]) === String(cursoId))
    .map(row => mapRowToObject(row, headers)); // Mapeia cada linha do histórico
}

function getAlunosConcluidosPorCurso(token, nomeCursoCompleto) {
  // Reutiliza a função getSolicitacoes, passando o token de sessão seguro.
  const allSolicitacoes = getSolicitacoes(token);
  return allSolicitacoes.filter(s =>
    s.nomeDoCurso === nomeCursoCompleto && s.status === 'Concluído'
  );
}

function createHeaderMap(actualHeaders, expectedHeaders) {
  const map = {};
  const normalizedActual = actualHeaders.map(h => normalizeHeader(h));
  expectedHeaders.forEach(expected => {
    const index = normalizedActual.indexOf(normalizeHeader(expected));
    if (index !== -1) {
      map[normalizeHeader(expected)] = index;
    }
  });
  return map;
}

function normalizeHeader(header) {
  if (!header || typeof header !== 'string') return '';
  return header.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * Mapeia uma linha de dados para um objeto JavaScript.
 * Converte automaticamente os cabeçalhos de snake_case para camelCase.
 * @param {Array} row - A linha de dados da planilha.
 * @param {Array} headers - A linha de cabeçalhos original da planilha.
 * @returns {Object} Um objeto com chaves em camelCase.
 */
function mapRowToObject(row, headers) {
  const obj = {};

  // Função interna para converter snake_case (e outros formatos) para camelCase
  const toCamelCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
      .replace(/^./, (match) => match.toLowerCase());
  };

  headers.forEach((header, index) => {
    const camelCaseKey = toCamelCase(header);
    if (camelCaseKey) { // Garante que não cria chaves vazias
      obj[camelCaseKey] = safeString(row[index]);
    }
  });

  return obj;
}

/**
 * @description Busca a lista de instituições configuradas APENAS para o módulo de declarações.
 * @param {string} token O token de sessão.
 * @returns {Array<string>} Uma lista com os nomes das instituições.
 */
function getDeclaracaoInstituicoes(token) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  // Retorna apenas as chaves (nomes das instituições) do objeto de configuração.
  return Object.keys(Constants().CONFIG_INSTITUICOES);
}