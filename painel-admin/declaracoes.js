/**
 * @fileoverview Contém toda a lógica de negócio para a geração e envio de declarações.
 * Este é um módulo do projeto do Painel de Administração do LearningFly.
 */

/**
 * @description Busca os dados de um usuário na API externa com base no CPF e instituição.
 * @param {string} token O token de sessão.
 * @param {string} cpf O CPF do aluno a ser consultado.
 * @param {string} instituicao O nome da instituição selecionada.
 * @returns {object} Um objeto com os dados do usuário ou um objeto de erro.
 */
function getUserData(token, cpf, instituicao) {
  if (!isTokenValid(token)) {
    throw new Error("Sessão inválida ou expirada. Faça o login novamente.");
  }
  if (!cpf || !instituicao) {
    return { error: "CPF e Instituição são obrigatórios." };
  }

  // Busca a configuração correta da instituição
  const config = Constants().CONFIG_INSTITUICOES[instituicao];
  if (!config || !config.apiUrl) {
    return { error: `Configuração da apiUrl não encontrada para a instituição: ${instituicao}` };
  }

  // Monta a URL final da API
  const url = `${config.apiUrl}${cpf}`;

  const options = {
    'method': 'get',
    'headers': {
      // Se a sua API precisar de um token, adicione-o aqui.
      // 'Authorization': 'Bearer SEU_TOKEN_AQUI' 
    },
    'muteHttpExceptions': true // Crucial para capturar erros como 404 (não encontrado)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const content = response.getContentText();

    if (responseCode === 200) {
      Logger.log(`Dados encontrados para o CPF ${cpf} na API de ${instituicao}.`);
      return JSON.parse(content);
    } else if (responseCode === 404) {
      Logger.log(`CPF ${cpf} não encontrado na API de ${instituicao}.`);
      return { error: "Aluno não encontrado. Verifique o CPF e a instituição selecionada." };
    } else {
      Logger.log(`Erro na API para o CPF ${cpf}. Código: ${responseCode}. Conteúdo: ${content}`);
      return { error: `Ocorreu um erro no servidor da instituição (Código: ${responseCode})` };
    }

  } catch (e) {
    Logger.log(`Falha crítica ao chamar a API: ${e.stack}`);
    return { error: "Não foi possível conectar ao serviço da instituição. Tente novamente mais tarde." };
  }
}

/**
 * @description Busca dinamicamente os cursos de um aluno para uma instituição específica, consumindo a API Redash configurada.
 * @param {string} token O token de sessão.
 * @param {string} cpf O CPF do aluno.
 * @param {string} instituicao O nome da instituição selecionada.
 * @returns {object} Um objeto contendo a lista de cursos ou um erro.
 */
function getCursosPorCpf(token, cpf, instituicao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!cpf || !instituicao) return { error: "CPF e Instituição são obrigatórios." };

  try {
    // 1. Obtém a configuração de importação específica para a instituição
    const config = Constants().CONFIG_INSTITUICOES[instituicao];
    if (!config || !config.importacao || !config.importacao.matriculas) {
      return { error: `Configuração de importação de matrículas não encontrada para a instituição: ${instituicao}.` };
    }
    const { queryId, apiKey } = config.importacao.matriculas;

    if (!queryId || !apiKey) {
      return { error: `QueryId ou ApiKey não definidos para a importação de matrículas de ${instituicao}.` };
    }

    // 2. Constrói a URL da API Redash dinamicamente
    const url = `https://redash.instituicao.com.br/api/queries/${queryId}/results.csv?api_key=${apiKey}`;

    // 3. Faz a chamada à API para obter o CSV de matrículas
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log(`Erro ao buscar matrículas da API para ${instituicao}. Código: ${responseCode}`);
      throw new Error(`Falha ao comunicar com o serviço de matrículas (Código: ${responseCode}).`);
    }

    const csvData = response.getContentText();
    const data = Utilities.parseCsv(csvData);

    // 4. Processa o CSV para encontrar os cursos do aluno
    if (data.length <= 1) return { error: "Nenhuma matrícula encontrada na fonte de dados." };

    const header = data.shift(); // Remove e obtém o cabeçalho
    const cpfColumnIndex = header.indexOf('cpf');
    const nomeCursoColumnIndex = header.indexOf('nome_curso');

    if (cpfColumnIndex === -1 || nomeCursoColumnIndex === -1) {
      return { error: 'O retorno da API de matrículas não contém as colunas "cpf" ou "nome_curso".' };
    }

    // 5. Filtra os cursos pelo CPF e retorna uma lista de valores únicos
    const cursos = data
      .filter(row => String(row[cpfColumnIndex]).trim() === String(cpf).trim())
      .map(row => row[nomeCursoColumnIndex]);

    const cursosUnicos = [...new Set(cursos)];

    if (cursosUnicos.length === 0) {
      return { error: `Nenhum curso encontrado para este CPF na instituição ${instituicao}.` };
    }

    return { cursos: cursosUnicos };

  } catch (e) {
    Logger.log(`Erro crítico em getCursosPorCpf para ${instituicao}: ${e.stack}`);
    return { error: `Não foi possível obter a lista de cursos: ${e.message}` };
  }
}


/**
 * @description Busca o RA (Registro Acadêmico) de um aluno na API Redash. Caso utilize uma API externa, deve ser configurada na constante CONFIG_INSTITUICOES.
 * @param {string} token O token de sessão.
 * @param {string} cpf O CPF do aluno.
 * @param {string} instituicao O nome da instituição.
 * @returns {string} O número do RA encontrado.
 * @throws {Error} Se o RA não for encontrado ou se ocorrer um erro na API.
 */
function getAlunoRA(token, cpf, instituicao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida.");

  try {
    const config = Constants().CONFIG_INSTITUICOES[instituicao];
    const { queryId, apiKey } = config.importacao.ras;
    if (!queryId || !apiKey) {
      throw new Error(`Configuração de API para RA não encontrada para ${instituicao}.`);
    }

    const url = `https://redash.instituicao.com.br/api/queries/${queryId}/results.json?api_key=${apiKey}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    if (response.getResponseCode() !== 200) {
      throw new Error("Falha ao comunicar com o serviço de RAs.");
    }

    const json = JSON.parse(response.getContentText());
    const data = json.query_result.data.rows;

    const alunoRa = data.find(row => String(row.cpf).trim() === String(cpf).trim());

    if (!alunoRa || !alunoRa.code) {
      throw new Error(`RA não encontrado para o CPF informado em ${instituicao}.`);
    }

    return alunoRa.code; // Retorna o RA (ex: 'code')

  } catch (e) {
    Logger.log(`Erro crítico em getAlunoRA: ${e.stack}`);
    throw new Error(e.message);
  }
}

/**
 * @description Orquestra a busca de dados (RA e detalhes da matrícula) e insere a linha
 * completa na planilha de declarações, utilizando a fonte de dados de matrícula correta para cada instituição.
 */
function preencherDadosNaPlanilha(token, cpf, cursoSelecionado, userDataFromApi, tipoDeclaracao, instituicao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");

  try {
    // 1. Busca o RA do Aluno usando a API (Lógica existente e correta)
    const numeroMatricula = getAlunoRA(token, cpf, instituicao);

    // 2. Busca os detalhes da Matrícula de forma dinâmica
    const config = Constants().CONFIG_INSTITUICOES[instituicao];
    const matriculasSpreadsheetId = config.spreadsheetId; // ID da planilha da instituição
    const matriculasSheetName = config.sheet_name_matriculas; // Nome da aba (ex: matriculas_alunos_instituicao_1 ou matriculas_alunos_instituicao_2)

    if (!matriculasSpreadsheetId || !matriculasSheetName) {
      throw new Error(`Configuração de planilha de matrículas não encontrada para a instituição: ${instituicao}.`);
    }

    const ssMatriculas = SpreadsheetApp.openById(matriculasSpreadsheetId);
    const matriculasSheet = ssMatriculas.getSheetByName(matriculasSheetName);
    
    if (!matriculasSheet) {
        throw new Error(`A aba de matrículas '${matriculasSheetName}' não foi encontrada na planilha da instituição.`);
    }

    const matriculasData = matriculasSheet.getDataRange().getValues();
    const mHeaders = matriculasData.shift(); // Pega e remove cabeçalho

    const cpfCol = mHeaders.indexOf('cpf');
    const cursoCol = mHeaders.indexOf('nome_curso');

    let dadosMatricula = null;
    for (const row of matriculasData) {
      if (String(row[cpfCol]).trim() === cpf && String(row[cursoCol]).trim() === cursoSelecionado) {
        dadosMatricula = {
          cargaHoraria: row[mHeaders.indexOf('carga_horaria')],
          dataInicio: row[mHeaders.indexOf('data_matricula')],
          dataConclusao: row[mHeaders.indexOf('data_conclusao')],
        };
        break;
      }
    }
    if (!dadosMatricula) {
      throw new Error(`Detalhes da matrícula para o curso "${cursoSelecionado}" não foram encontrados nos dados de ${instituicao}.`);
    }

    // 3. Busca a Área de Conhecimento (Lógica existente e correta)
    const cursosSheet = SpreadsheetApp.openById(Config.SHEETS.SPREADSHEET_ID_POSGRADUACAO).getSheetByName(Constants().SHEET_NAMES.CURSOS);
    const cursosData = cursosSheet.getDataRange().getValues();
    const cHeaders = cursosData.shift();
    const nomeCursoCompletoCol = cHeaders.indexOf('nome_curso_completo');
    const areaConhecimentoCol = cHeaders.indexOf('area_conhecimento');
    let areaConhecimento = '';
    const nomeCursoBuscadoNormalizado = cursoSelecionado.trim().toLowerCase();
    for (const row of cursosData) {
        const nomeCursoAtualNormalizado = String(row[nomeCursoCompletoCol]).trim().toLowerCase();
        if (nomeCursoAtualNormalizado === nomeCursoBuscadoNormalizado) {
            areaConhecimento = row[areaConhecimentoCol];
            break;
        }
    }
    
    // 4. Prepara e insere os dados na planilha de destino (Lógica existente e correta)
    const instConfig = Constants().CONFIG_INSTITUICOES[instituicao];
    const sheetId = instConfig.spreadsheetId;
    const sheetName = instConfig[tipoDeclaracao.replace('.', '_')];
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

    const novaLinha = [
      userDataFromApi.name, "'" + userDataFromApi.document, userDataFromApi.email,
      "'" + numeroMatricula, cursoSelecionado,
      dadosMatricula.dataInicio, dadosMatricula.dataConclusao,
      dadosMatricula.cargaHoraria, areaConhecimento,
      new Date(), 'Emitir', '', '', '',
    ];
    sheet.appendRow(novaLinha);

    return `Declaração para ${userDataFromApi.name} inserida com sucesso!`;

  } catch (e) {
    Logger.log(`Falha em preencherDadosNaPlanilha: ${e.stack}`);
    throw new Error(e.message);
  }
}

/**
 * @description Gera uma única declaração, salva a URL do PDF na planilha e retorna para o front-end.
 */
function gerarDeclaracaoParaLinha(token, instituicao, tipoDeclaracao, rowIndex) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");

  // 1. Obter as configurações
  const instConfig = Constants().CONFIG_INSTITUICOES[instituicao];
  const docsConfig = Config.DOCS;

  if (!instConfig || !docsConfig) {
    throw new Error(`Configurações de instituição ou documentos não encontradas.`);
  }

  // 2. Identificar a planilha, o template e a pasta de destino (de forma direta)
  const sheetId = instConfig.spreadsheetId;
  const sheetName = instConfig[tipoDeclaracao.replace('.', '_')];
  const templateId = tipoDeclaracao === 'declaracoes.matricula' ? docsConfig.TEMPLATE_DECLARACAO_MATRICULA_ID : docsConfig.TEMPLATE_DECLARACAO_CONCLUSAO_ID;

  // Lê o ID da pasta diretamente da configuração da instituição
  const pastaId = tipoDeclaracao === 'declaracoes.matricula' ? instConfig.folder_id_matricula : instConfig.folder_id_conclusao;

  if (!sheetId || !sheetName || !templateId || !pastaId) {
    // A mensagem de erro agora é mais precisa se algo falhar
    console.error({ sheetId, sheetName, templateId, pastaId });
    throw new Error("Uma ou mais configurações (planilha, aba, template, pasta) não foram encontradas.");
  }
  const ss = SpreadsheetApp.openById(sheetId);
  const aba = ss.getSheetByName(sheetName);
  if (!aba) throw new Error(`Aba "${sheetName}" não foi encontrada.`);

  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  const dadosLinha = aba.getRange(rowIndex, 1, 1, aba.getLastColumn()).getValues()[0];

  const colunaIdDoc = cabecalho.indexOf("ID DOC");
  const colunaGerador = cabecalho.indexOf("Gerador");

  if (dadosLinha[colunaIdDoc] !== "") throw new Error(`A declaração já foi gerada.`);

  const tags = {};
  cabecalho.forEach((header, index) => { tags[header] = dadosLinha[index]; });

  const resultadoGeracao = criarDeclaracaoAPartirDoTemplate(templateId, pastaId, tags, aba, rowIndex);

  if (colunaIdDoc !== -1) aba.getRange(rowIndex, colunaIdDoc + 1).setValue(resultadoGeracao.pdfUrl);
  if (colunaGerador !== -1) aba.getRange(rowIndex, colunaGerador + 1).setValue("Emitido");

  SpreadsheetApp.flush();

  return {
    message: `Declaração para ${tags['Nome Completo']} gerada com sucesso!`,
    pdfUrl: resultadoGeracao.pdfUrl
  };
}

/**
 * @description Cria o documento e retorna um objeto com o ID do Doc temporário e a URL do PDF final.
 */
function criarDeclaracaoAPartirDoTemplate(templateId, pastaId, tags, aba, numeroLinha) {
  try {
    const templateFile = DriveApp.getFileById(templateId);
    const nomeAluno = tags['Nome Completo'] || 'Nome Desconhecido';
    const cpf = tags['CPF'] || 'CPF Desconhecido';
    const nomeCurso = tags['Nome do Curso'] || 'Curso Desconhecido';
    const codigoAleatorio = gerarCodigoAleatorio(6);
    const nomeNovoDocumento = `${cpf} - ${nomeCurso} - ${nomeAluno} - ${codigoAleatorio}`;

    const novoDocumento = templateFile.makeCopy(nomeNovoDocumento);
    const novoDocumentoId = novoDocumento.getId();
    const novoDocumentoObj = DocumentApp.openById(novoDocumentoId);
    const corpo = novoDocumentoObj.getBody();

    for (const tag in tags) {
      let valor = tags[tag];
      if (valor instanceof Date) {
        valor = valor.toLocaleDateString('pt-BR');
      }
      corpo.replaceText(`{{${tag}}}`, valor || '');
    }

    novoDocumentoObj.saveAndClose();

    // Cria o PDF e obtém sua URL 
    const blob = novoDocumentoObj.getAs('application/pdf');
    const pdfFile = DriveApp.getFolderById(pastaId).createFile(blob).setName(nomeNovoDocumento + ".pdf");
    const pdfUrl = pdfFile.getUrl();

    DriveApp.getFileById(novoDocumentoId).setTrashed(true);

    const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    const colunaCodigoAleatorio = cabecalho.indexOf("CodigoAleatorio");
    if (colunaCodigoAleatorio !== -1) {
      aba.getRange(numeroLinha, colunaCodigoAleatorio + 1).setValue(codigoAleatorio);
    }

    // Retorna um objeto com o ID e a URL do PDF 
    return { docId: novoDocumentoId, pdfUrl: pdfUrl };
  } catch (e) {
    throw new Error(`Erro ao criar documento a partir do template: ${e.message}`);
  }
}

/**
 * @description Gera uma string aleatória de um tamanho específico.
 */
function gerarCodigoAleatorio(tamanho) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

/**
 * @description Busca todas as linhas da planilha de declarações de uma instituição e tipo.
 * @param {string} token O token de sessão.
 * @param {string} instituicao O nome da instituição.
 * @param {string} tipoDeclaracao O tipo de declaração a ser buscado (ex: 'declaracoes.matricula').
 * @returns {Array<Object>} Um array de objetos, onde cada objeto representa uma linha.
 */
function getDeclaracoes(token, instituicao, tipoDeclaracao) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");
  if (!instituicao || !tipoDeclaracao) throw new Error("Instituição e Tipo de Declaração são obrigatórios.");

  // Identifica a planilha e a aba de destino com base na instituição e no tipo
  const instConfig = Constants().CONFIG_INSTITUICOES[instituicao];
  const sheetId = instConfig.spreadsheetId;
  const sheetName = instConfig[tipoDeclaracao.replace('.', '_')]; // ex: matriculas_alunos_instituicao_1

  if (!sheetId || !sheetName) {
    throw new Error(`Configuração de planilha não encontrada para ${tipoDeclaracao} de ${instituicao}`);
  }

  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  const data = values.map((row, index) => {
    const obj = { rowIndex: index + 2 };
    headers.forEach((header, i) => {
      let value = row[i];
      if (value instanceof Date) {
        value = value.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      }
      obj[header] = value;
    });
    return obj;
  });

  return data.reverse();
}

/**
 * @description Envia por e-mail a declaração em PDF para o aluno, utilizando o serviço GmailApp para garantir o uso do alias.
 * @param {string} token O token de sessão.
 * @param {string} instituicao O nome da instituição.
 * @param {string} tipoDeclaracao O tipo de declaração.
 * @param {number} rowIndex O número da linha a ser processada.
 * @returns {string} Mensagem de sucesso.
 */
function enviarDeclaracaoPorEmail(token, instituicao, tipoDeclaracao, rowIndex) {
  if (!isTokenValid(token)) throw new Error("Sessão inválida ou expirada.");

  // Etapas 1, 2 e 3 permanecem as mesmas
  const instConfig = Constants().CONFIG_INSTITUICOES[instituicao];
  const sheetId = instConfig.spreadsheetId;
  const sheetName = instConfig[tipoDeclaracao.replace('.', '_')];
  const ss = SpreadsheetApp.openById(sheetId);
  const aba = ss.getSheetByName(sheetName);
  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  const dadosLinha = aba.getRange(rowIndex, 1, 1, aba.getLastColumn()).getValues()[0];
  const nomeAluno = dadosLinha[cabecalho.indexOf('Nome Completo')];
  const emailAluno = dadosLinha[cabecalho.indexOf('E-mail')];
  const pdfUrl = dadosLinha[cabecalho.indexOf('ID DOC')];
  const colunaEnvio = cabecalho.indexOf('Envio por Email');
  const emailAlias = instConfig.email_alias;

  if (!emailAluno) throw new Error("E-mail do aluno não encontrado.");
  if (!pdfUrl || !pdfUrl.startsWith('http')) throw new Error("PDF não encontrado. Gere o PDF primeiro.");

  const pdfFile = DriveApp.getFileById(pdfUrl.match(/[-\w]{25,}/)[0]);
  const tipo = tipoDeclaracao.replace('declaracoes.', '');
  const assunto = instConfig[`assunto_decla_${tipo}`];
  const corpo = instConfig[`corpo_decla_${tipo}`].replace('[Nome]', nomeAluno);

  // 4. Monta o objeto de opções para o GmailApp
  const emailOptions = {
    attachments: [pdfFile.getAs(MimeType.PDF)],
    // Se um alias estiver configurado, usa-o. Caso contrário, não define a opção 'from'.
    from: emailAlias || undefined
  };

  // 5. Usa GmailApp.sendEmail em vez de MailApp.sendEmail para poder trabalhar com alias.
  GmailApp.sendEmail(emailAluno, assunto, corpo, emailOptions);

  // 6. Atualiza o status na planilha
  if (colunaEnvio !== -1) {
    aba.getRange(rowIndex, colunaEnvio + 1).setValue("Enviado em " + new Date().toLocaleString('pt-BR'));
  }

  return `Declaração enviada com sucesso para ${emailAluno}!`;
}