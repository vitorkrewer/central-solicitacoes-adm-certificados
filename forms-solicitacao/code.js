// Constante para armazenar o ID da sua planilha.
const SPREADSHEET_ID = "Insira o ID da sua planilha aqui"; 
// Nome da aba/página da sua planilha onde os dados serão salvos.
const SHEET_NAME = "solicitacoes";
// Nome da aba com a lista de instituições e cursos.
const COURSE_LIST_SHEET_NAME = "lista_cursos";

/**
 * @description Função principal que é executada quando o aplicativo web é acessado.
 * Ela serve a página HTML para o usuário.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('solicitacao');
  // Carrega os links de pagamento e os cursos para dentro do template HTML
  template.paymentLinks = getPaymentLinks();
  template.cursosData = getCursos();

  return template.evaluate()
    .setTitle('Solicitação de Histórico e Certificado')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * @description Retorna a lista de instituições e cursos da planilha.
 */
function getCursos() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(COURSE_LIST_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const cursosPorInstituicao = {};

    for (let i = 1; i < data.length; i++) {
      const instituicao = data[i][0];
      const curso = data[i][1];
      if (!instituicao || !curso) continue;
      if (!cursosPorInstituicao[instituicao]) {
        cursosPorInstituicao[instituicao] = [];
      }
      cursosPorInstituicao[instituicao].push(curso);
    }
    return cursosPorInstituicao;
  } catch (error) {
    console.error("Erro ao buscar lista de cursos: " + error.toString());
    return {};
  }
}

/**
 * @description Salva os dados do formulário na planilha, garantindo que o CPF seja formatado como texto.
 */
function salvarDados(formData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    const protocolo = new Date().getTime().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
    const timestamp = new Date();
    const statusInicial = "Recebido";

    const newRow = [
      protocolo, 
      timestamp, 
      formData.nome, 
      "'" + formData.cpf, // Adiciona uma apóstrofe para forçar o formato de texto
      formData.rg,
      formData.ufRG, 
      formData.dataNascimento, 
      formData.nacionalidade,
      formData.genero, 
      formData.email, 
      formData.telefone, 
      formData.instituicao,
      formData.curso, 
      formData.inicioCurso, 
      formData.optouTCC,
      formData.modalidadeEnvio.join(', '), 
      formData.idTransacao,
      formData.cep,
      formData.endereco, 
      formData.numero, 
      formData.complemento,
      formData.bairro, 
      formData.cidade, 
      formData.uf,
      statusInicial, 
      "" // Observações iniciais em branco
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      status: "success", 
      message: "Sua solicitação foi enviada com sucesso!",
      protocolo: protocolo 
    };

  } catch (error) {
    console.error("Erro ao salvar dados: " + error.toString());
    throw new Error("Ocorreu um erro ao processar sua solicitação. Detalhes: " + error.message);
  }
}

/**
 * @description Retorna os links de pagamento para cada instituição.
 * @returns {Object} - Um objeto com os links de pagamento.
 */
function getPaymentLinks() {
  return {
    "Instituição 1": {
      "Retirada": "insira o link para pagamento de taxas aqui",
      "Correios": "insira o link para pagamento de taxas aqui"
    },
    "Instituição 2": {
      "Retirada": "insira o link para pagamento de taxas aquia",
      "Correios": "insira o link para pagamento de taxas aqui"
    }
    // Adicione outras instituições e seus links aqui. O getPaymentLinks é utilizado caso o usuário deva pagar a taxa de emissão do certificado.
  };
}