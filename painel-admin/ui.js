// Funções que manipulam o DOM ou renderizam conteúdo
// Inicialização da UI
document.addEventListener('DOMContentLoaded', () => {
});

function showSpinner(show) { document.getElementById('loading-spinner').style.display = show ? 'block' : 'none'; }

function showNotification(title, message, link = null, isError = false) {
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');
    const toastElement = document.getElementById('notificationToast');

    toastTitle.textContent = title;

    // Se um link for passado, ela usará innerHTML.
    if (link) {
        toastBody.innerHTML = `${message} <a href="${link}" target="_blank" class="alert-link">Clique aqui para abrir.</a>`;
    } else {
        toastBody.textContent = message;
    }

    toastElement.className = 'toast';
    toastElement.classList.add(isError ? 'bg-danger' : 'bg-success', 'text-white');

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function toggleViews(viewName) {
    const solicitacoesView = document.getElementById('solicitacoes-view');
    const indicatorsView = document.getElementById('indicators-content');
    const dataView = document.getElementById('data-view-content');
    const historicoView = document.getElementById('historico-view');
    const declarationsView = document.getElementById('declarations-content');

    solicitacoesView.style.display = 'none';
    indicatorsView.style.display = 'none';
    dataView.style.display = 'none';
    historicoView.style.display = 'none';
    declarationsView.style.display = 'none';

    if (viewName === 'Indicadores') {
        indicatorsView.style.display = 'block';
        calculateAndDisplayIndicators(allData);
    } else if (viewName === 'Dados') {
        dataView.style.display = 'block';
        renderDataTable(allData);
    } else if (viewName === 'Histórico Acadêmico') {
        historicoView.style.display = 'block';
    } else if (viewName === 'Declaracoes') {
        declarationsView.style.display = 'block';
        inicializarAbaDeclaracoes();
    } else {
        solicitacoesView.style.display = 'block';
        filterAndDisplayData();
    }
}

function filterAndDisplayData() {
    let statusFilteredData = (activeStatus === 'Todos') ? allData : allData.filter(row => (row.status || 'Recebido') === activeStatus);
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const finalFilteredData = searchTerm ? statusFilteredData.filter(row => (row.nomeCompleto || '').toLowerCase().includes(searchTerm) || (row.cpf || '').toLowerCase().includes(searchTerm) || (row.protocolo || '').toString().toLowerCase().includes(searchTerm)) : statusFilteredData;
    renderTableAndPagination(finalFilteredData);
}

function renderTableAndPagination(data) {
    const tableBody = document.getElementById('requests-table-body');
    tableBody.innerHTML = '';
    const rowsPerPage = parseInt(document.getElementById('rows-per-page').value, 10);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages > 0 ? totalPages : 1;
    const paginatedItems = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    if (paginatedItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma solicitação encontrada.</td></tr>';
    } else {
        paginatedItems.forEach(row => {
            const tr = document.createElement('tr');
            const status = row.status || 'Recebido';
            const statusClass = 'status-' + status.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
            tr.classList.add(statusClass);
            const statusOptions = ['Recebido', 'Em Análise', 'Indeferido', 'Concluído', 'Cancelado'];
            const statusSelect = `<select class="form-select form-select-sm" id="status-${row.protocolo}">${statusOptions.map(opt => `<option value="${opt}" ${opt === status ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
            tr.innerHTML = `<td>${row.protocolo || ''}</td><td>${row.timestamp ? new Date(row.timestamp).toLocaleDateString('pt-BR') : ''}</td><td>${row.nomeCompleto || ''}</td><td>${row.instituicao || ''}</td><td>${row.nomeDoCurso || ''}</td><td>${statusSelect}</td><td><button class="btn btn-outline-secondary btn-sm" onclick='showDetails(${JSON.stringify(row)})'><i class="bi bi-eye"></i></button> <button class="btn btn-primary btn-sm" onclick="updateStatus('${row.protocolo}')" ${!row.protocolo ? 'disabled' : ''}><i class="bi bi-save"></i></button></td>`;
            tableBody.appendChild(tr);
        });
    }
    renderPaginationControls(data.length);
}

function renderPaginationControls(totalItems) {
    const paginationUl = document.querySelector('#pagination-controls .pagination');
    paginationUl.innerHTML = '';
    const rowsPerPage = parseInt(document.getElementById('rows-per-page').value, 10);
    const pageCount = Math.ceil(totalItems / rowsPerPage);

    if (pageCount <= 1) return;

    function createPageItem(page, text, isDisabled = false, isActive = false) {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        if (text === '...') {
            li.innerHTML = `<span class="page-link">...</span>`;
        } else {
            li.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); changePage(${page})">${text}</a>`;
        }
        return li;
    }
    paginationUl.appendChild(createPageItem(currentPage - 1, 'Anterior', currentPage === 1));
    const maxPagesToShow = 7;
    if (pageCount <= maxPagesToShow) {
        for (let i = 1; i <= pageCount; i++) {
            paginationUl.appendChild(createPageItem(i, i, false, i === currentPage));
        }
    } else {
        let pages = [1];
        let start = Math.max(2, currentPage - 1), end = Math.min(pageCount - 1, currentPage + 1);
        if (currentPage <= 3) end = 4;
        if (currentPage >= pageCount - 2) start = pageCount - 3;
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < pageCount - 1) pages.push('...');
        pages.push(pageCount);
        pages.forEach(p => { paginationUl.appendChild(createPageItem(p, p, false, p === currentPage)); });
    }
    paginationUl.appendChild(createPageItem(currentPage + 1, 'Próximo', currentPage === pageCount));
}

function renderDataTable(data) {
    const tableHead = document.getElementById('data-table-head');
    const tableBody = document.getElementById('data-table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    if (!data || data.length === 0) return;

    const formatDateBR = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const dia = String(date.getUTCDate()).padStart(2, '0');
        const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
        const ano = date.getUTCFullYear();
        return ano > 1900 ? `${dia}/${mes}/${ano}` : '';
    };

    const columnKeys = Object.keys(COLUMN_NAMES);

    let headerHtml = '<tr><th class="text-center"><input type="checkbox" class="form-check-input" id="select-all-rows"></th>';
    columnKeys.forEach(key => { headerHtml += `<th>${COLUMN_NAMES[key]}</th>`; });
    headerHtml += '<th>Ação</th></tr>';
    tableHead.innerHTML = headerHtml;

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        let rowHtml = `<td class="text-center"><input type="checkbox" class="form-check-input row-selector" data-index="${index}"></td>`;
        columnKeys.forEach(key => {
            let cellValue = row[key] || '';
            if (key === 'timestamp' || key === 'dataNascimento' || key === 'inicioDoCurso') {
                cellValue = formatDateBR(cellValue);
            }
            rowHtml += `<td>${cellValue}</td>`;
        });
        rowHtml += `<td><button class="btn btn-sm btn-outline-secondary copy-row-btn" title="Copiar Linha" data-index="${index}"><i class="bi bi-clipboard"></i></button></td>`;
        tr.innerHTML = rowHtml;
        tableBody.appendChild(tr);
    });

    addListenersToDataTable();
}
function updateCopySelectedButton() {
    const anyChecked = document.querySelectorAll('.row-selector:checked').length > 0;
    document.getElementById('copy-selected-btn').style.display = anyChecked ? 'inline-block' : 'none';
}

function renderCursoDetails(details) {
    const container = document.getElementById('curso-details-display');
    const dataInicioFormatada = details.inicio ? new Date(details.inicio).toLocaleDateString('pt-BR') : '';

    container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>ID do Curso:</strong> ${details.idCurso}</p>
                    <p><strong>Instituição:</strong> ${details.instituicao}</p>
                    <p><strong>Turma:</strong> ${details.turma}</p>
                    <p><strong>Carga Horária:</strong> ${details.ch}h</p>
                    <p><strong>Área do Conhecimento:</strong> ${details.areaConhecimento}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Coordenador:</strong> ${details.coordenador}</p>
                    <p><strong>Documento:</strong> ${details.tipoDoc} nº ${details.nDoc}/${details.anoDoc}</p>
                    <p><strong>Início:</strong> ${dataInicioFormatada}</p>
                    <p><strong>Link e-MEC:</strong> <a href="${details.linkEMec}" target="_blank">Acessar</a></p>
                </div>
            </div>`;
}

function renderHistoricoTable(historico) {
    const container = document.getElementById('historico-table-container');
    if (historico.length === 0) {
        container.innerHTML = '<p>Nenhuma disciplina encontrada para este curso.</p>';
        return;
    }

    let tableHtml = `
            <table class="table table-sm table-bordered table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Disciplina</th>
                        <th>Carga Horária</th>
                        <th>Professor</th>
                        <th>Titulação</th>
                    </tr>
                </thead>
                <tbody>`;

    historico.forEach(disciplina => {
        tableHtml += `
                <tr>
                    <td>${disciplina.disciplina}</td>
                    <td>${disciplina.cargaHoraria}h</td>
                    <td>${disciplina.professor}</td>
                    <td>${disciplina.titulacao}</td>
                </tr>`;
    });

    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
}

function renderAlunosList(alunos) {
    const container = document.getElementById('aluno-list');
    const exportBtn = document.getElementById('export-historico-btn');
    container.innerHTML = ''; // Limpa a lista

    if (alunos.length === 0) {
        container.innerHTML = '<div class="list-group-item">Nenhum aluno com status "Concluído" encontrado para este curso.</div>';
        exportBtn.disabled = true;
        return;
    }

    alunos.forEach(aluno => {
        const item = document.createElement('label');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
                <span>
                    <input class="form-check-input me-2" type="checkbox" value="${aluno.protocolo}" data-aluno-obj='${JSON.stringify(aluno)}'>
                    ${aluno.nomeCompleto}
                </span>
                <small class="text-muted">${aluno.cpf}</small>
            `;
        container.appendChild(item);
    });

    // Adiciona listener para habilitar/desabilitar o botão de exportar
    container.querySelectorAll('.form-check-input').forEach(chk => {
        chk.addEventListener('change', () => {
            const anyChecked = container.querySelector('.form-check-input:checked');
            exportBtn.disabled = !anyChecked;
        });
    });
}

// Função de Erro Genérica
function handleError(error) {
    showSpinner(false);
    showNotification('Ocorreu um Erro', error.message || 'Erro desconhecido.', true);
    console.error(error);
}