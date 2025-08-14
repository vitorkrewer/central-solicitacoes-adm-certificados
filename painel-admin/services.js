// services.js
//Funções que lidam com dados, chamadas ao google.script.run, cálculos e lógica de negócio

function fetchData() {
    showSpinner(true);
    google.script.run.withSuccessHandler(data => {
        allData = data || [];
        currentPage = 1;
        setupMainTabListeners();
        setupSolicitacoesTabListeners();
        const activeTab = document.querySelector('#statusTabs .nav-link.active').getAttribute('data-status');
        toggleViews(activeTab);
        showSpinner(false);
    }).withFailureHandler(handleError).getSolicitacoes(sessionToken);
}

function handleLogin() {
    showSpinner(true);
    const username = document.getElementById('username').value;
    const key = document.getElementById('clientKey').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';

    google.script.run.withSuccessHandler(response => {
        showSpinner(false);
        if (response.success) {
            sessionToken = response.token;
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            
            // Inicializa os Modais do Bootstrap
            detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
            columnSelectModal = new bootstrap.Modal(document.getElementById('column-select-modal'));
            aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));
            
            // **MUDANÇA AQUI:** Mantemos esta chamada para obter o mapeamento de CNPJs
            google.script.run.withSuccessHandler(config => {
                cnpjsInstituicoes = config;
            }).withFailureHandler(handleError).getInstituicoesConfig(sessionToken);
            
            // Inicia a visualização do Histórico e Declarações (que usam a lista dinâmica)
            initHistoricoView();
            fetchData();

        } else {
            errorDiv.style.display = 'block';
        }
    }).withFailureHandler(handleError).authenticate(username, key);
}

function updateStatus(protocolo) {
    showSpinner(true);
    const newStatus = document.getElementById(`status-${protocolo}`).value;
    google.script.run.withSuccessHandler(handleUpdateSuccess).withFailureHandler(handleError).atualizarStatus(sessionToken, protocolo, newStatus);
}

function salvarObservacoes(protocolo) {
    showSpinner(true);
    const novasObs = document.getElementById('obsTextarea').value.trim();
    google.script.run.withSuccessHandler(msg => {
        showNotification('Sucesso', msg);
        const solicitacao = allData.find(d => d.protocolo === protocolo);
        if (solicitacao) solicitacao.observacoes = novasObs;
        showSpinner(false);
    }).withFailureHandler(handleError).atualizarObservacoes(sessionToken, protocolo, novasObs);
}

function handleUpdateSuccess(message) {
    showNotification('Sucesso', message);
    fetchData();
}

function handleError(error) {
    showSpinner(false);
    showNotification('Erro', error.message, true);
}

function copiarCSVDetalhado(row) {
    const headers = ["cnpj_instituicao", "data_emissao", "nacionalidade", "genero", "nome_aluno", "data_nascimento", "possui_cpf", "cpf", "rg", "rg_uf", "documento_de_estrangeiro", "cep", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "email", "celular"];
    const cnpj = cnpjsInstituicoes[row.instituicao] || "";
    const possuiCpf = row.cpf ? "SIM" : "NAO";
    const linha = [`"${cnpj}"`, "", `"${row.nacionalidade || ''}"`, `"${row.genero || ''}"`, `"${row.nomeCompleto || ''}"`, `"${row.dataNascimento || ''}"`, possuiCpf, `"${row.cpf || ''}"`, `"${row.rg || ''}"`, `"${row.ufRG || ''}"`, "", `"${row.cep || ''}"`, `"${row.endereco || ''}"`, `"${row.numero || ''}"`, `"${row.complemento || ''}"`, `"${row.bairro || ''}"`, `"${row.cidade || ''}"`, `"${row.uf || ''}"`, `"${row.email || ''}"`, `"${row.telefone || ''}"`];
    const csv = headers.join(",") + "\n" + linha.join(",");
    navigator.clipboard.writeText(csv).then(() => {
        showNotification("Sucesso", "CSV copiado para a área de transferência.");
    }).catch(err => {
        showNotification("Erro", "Não foi possível copiar o CSV.", true);
    });
}
function calculateAndDisplayIndicators(data) {
    if (!data || data.length === 0) {
        document.getElementById('indicators-content').innerHTML = '<p>Não há dados suficientes para gerar indicadores.</p>';
        return;
    }
    const institutions = {};
    const statusCounts = { 'Recebido': 0, 'Em Análise': 0, 'Concluído': 0, 'Indeferido': 0, 'Cancelado': 0 };
    const courseCounts = {}, stateCounts = {};
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const fifteenDaysAgo = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000)); fifteenDaysAgo.setHours(0, 0, 0, 0);
    const last15DaysData = {};
    data.forEach(req => {
        const currentStatus = req.status || 'Recebido';
        if (statusCounts.hasOwnProperty(currentStatus)) statusCounts[currentStatus]++;
        if (req.nomeDoCurso) courseCounts[req.nomeDoCurso] = (courseCounts[req.nomeDoCurso] || 0) + 1;
        const state = req.ufRG ? req.ufRG.toUpperCase().trim() : 'Não Informado';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
        if (req.instituicao && req.timestamp) {
            const institutionName = req.instituicao;
            if (!institutions[institutionName]) institutions[institutionName] = { total: 0, days: new Set(), months: new Set() };
            const reqDate = new Date(req.timestamp);
            if (!isNaN(reqDate.getTime())) {
                institutions[institutionName].total++;
                institutions[institutionName].days.add(reqDate.toLocaleDateString('pt-BR'));
                institutions[institutionName].months.add(reqDate.getFullYear() + '/' + (reqDate.getMonth() + 1));
                if (reqDate >= fifteenDaysAgo && reqDate <= today) {
                    const dateKey = reqDate.toISOString().split('T')[0];
                    if (!last15DaysData[dateKey]) last15DaysData[dateKey] = {};
                    if (!last15DaysData[dateKey][institutionName]) last15DaysData[dateKey][institutionName] = 0;
                    last15DaysData[dateKey][institutionName]++;
                }
            }
        }
    });
    const avgCardsContainer = document.getElementById('average-indicators-cards');
    avgCardsContainer.innerHTML = '';
    const statusCardHtml = `<div class="col-md-6 col-lg-4 mb-3"><div class="card text-white bg-dark"><div class="card-header fw-bold">Status das Solicitações</div><div class="card-body">${Object.entries(statusCounts).map(([status, count]) => `<p class="card-text d-flex justify-content-between mb-2"><span>${status}:</span><span class="badge bg-light text-dark">${count}</span></p>`).join('')}</div></div></div>`;
    avgCardsContainer.innerHTML += statusCardHtml;
    for (const name in institutions) {
        const inst = institutions[name];
        const avgDay = inst.days.size > 0 ? (inst.total / inst.days.size).toFixed(2) : 0;
        const avgMonth = inst.months.size > 0 ? (inst.total / inst.months.size).toFixed(2) : 0;
        avgCardsContainer.innerHTML += `<div class="col-md-6 col-lg-4 mb-3"><div class="card"><div class="card-header fw-bold">${name}</div><div class="card-body"><p class="card-text">Total de Solicitações: <strong>${inst.total}</strong></p><p class="card-text">Média por Dia: <strong>${avgDay}</strong></p><p class="card-text">Média por Mês: <strong>${avgMonth}</strong></p></div></div></div>`;
    }
    const createTop10Card = (title, data) => {
        const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 10);
        let listHtml = sortedData.map(([item, count]) => `<li class="list-group-item d-flex justify-content-between align-items-center">${item}<span class="badge bg-primary rounded-pill">${count}</span></li>`).join('');
        if (listHtml.length === 0) listHtml = '<p class="text-center p-3">Não há dados.</p>';
        return `<div class="col-md-6 mb-4"><div class="card"><div class="card-header fw-bold">${title}</div><ul class="list-group list-group-flush">${listHtml}</ul></div></div>`;
    };
    const top10Row = document.createElement('div');
    top10Row.className = 'row mt-2';
    top10Row.innerHTML += createTop10Card('Top 10 Cursos', courseCounts);
    top10Row.innerHTML += createTop10Card('Top 10 Estados (UF do RG)', stateCounts);
    avgCardsContainer.appendChild(top10Row);
    const uniqueInstitutions = Object.keys(institutions);
    const thead15 = document.getElementById('last-15-days-thead');
    const tbody15 = document.getElementById('last-15-days-tbody');
    thead15.innerHTML = `<tr><th>Data</th>${uniqueInstitutions.map(name => `<th>${name}</th>`).join('')}</tr>`;
    tbody15.innerHTML = '';
    const sortedDates = Object.keys(last15DaysData).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.forEach(dateKey => {
        let rowHtml = `<tr><td>${new Date(dateKey).toLocaleDateString('pt-BR')}</td>`;
        uniqueInstitutions.forEach(instName => { rowHtml += `<td>${last15DaysData[dateKey][instName] || 0}</td>`; });
        tbody15.innerHTML += rowHtml + '</tr>';
    });
    if (tbody15.innerHTML === '') {
        tbody15.innerHTML = `<tr><td colspan="${uniqueInstitutions.length + 1}" class="text-center">Nenhuma solicitação nos últimos 15 dias.</td></tr>`;
    }
}