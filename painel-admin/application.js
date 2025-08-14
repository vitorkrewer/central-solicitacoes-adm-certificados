<script>
    //Funções de inicialização geral, glue code e entry point
    let cnpjsInstituicoes = {};

    const COLUMN_NAMES = {
        protocolo: "Protocolo", timestamp: "Data", nomeCompleto: "Nome Completo", cpf: "CPF", rg: "RG",
        ufRG: "UF do RG", dataNascimento: "Data de Nascimento", nacionalidade: "Nacionalidade", genero: "Gênero",
        email: "E-mail", telefone: "Telefone", instituicao: "Instituição", nomeDoCurso: "Curso",
        inicioDoCurso: "Início do Curso", optouTCC: "Optou por TCC", modalidadeEnvio: "Modalidade de Envio",
        idTransacao: "ID da Transação", cep: "CEP", endereco: "Endereço", numero: "Número", complemento: "Complemento",
        bairro: "Bairro", cidade: "Cidade", uf: "UF", status: "Status", observacoes: "Observações"
    };

    const toast = new bootstrap.Toast(document.getElementById('notificationToast'));
    let detailsModal = null;
    let columnSelectModal = null;
    let aboutModal = null;
    let allData = [];
    let sessionToken = null;
    let currentPage = 1;
    let activeStatus = 'Todos';
    let historicoDataCache = {}; // Cache para dados de histórico

    function changePage(page) {
        currentPage = page;
        filterAndDisplayData();
    }

    function copySelectedData() {
        const selectedColumns = [];
        document.querySelectorAll('#column-select-body .form-check-input:checked').forEach(chk => {
            selectedColumns.push(chk.value);
        });

        if (selectedColumns.length === 0) {
            showNotification('Atenção', 'Selecione pelo menos uma coluna para copiar.', true);
            return;
        }

        const selectedRowsIndexes = [];
        document.querySelectorAll('#data-table-body .row-selector:checked').forEach(chk => {
            selectedRowsIndexes.push(chk.getAttribute('data-index'));
        });

        let output = selectedColumns.map(key => `"${COLUMN_NAMES[key]}"`).join('\t') + '\n';
        selectedRowsIndexes.forEach(index => {
            const rowData = allData[index];
            if (rowData) {
                const line = selectedColumns.map(key => `"${rowData[key] || ''}"`).join('\t');
                output += line + '\n';
            }
        });

        navigator.clipboard.writeText(output).then(() => {
            showNotification('Sucesso', `${selectedRowsIndexes.length} linha(s) copiadas com sucesso.`);
            columnSelectModal.hide();
        }, () => {
            showNotification('Erro', 'Falha ao copiar os dados.', true);
        });
    }

    // =================== LÓGICA PARA SHEET_NAME DE HISTÓRICO ACADÊMICO ===================
    let cursosCache = []; // Cache para a lista de cursos da instituição selecionada

    function initHistoricoView() {
        // Elementos da UI
        const instituicaoSelect = document.getElementById('instituicao-select');
        const cursoSearchInput = document.getElementById('curso-search-input');
        const findAlunosBtn = document.getElementById('find-alunos-btn');
        const exportTemplateBtn = document.getElementById('export-template-btn');
        const exportHistoricoBtn = document.getElementById('export-historico-btn');

        // Preenche o dropdown de instituições
        showSpinner(true);
        google.script.run
            .withSuccessHandler(instituicoes => {
                instituicaoSelect.innerHTML = '<option selected disabled value="">Selecione uma instituição...</option>';
                (instituicoes || []).forEach(inst => {
                    if (inst) { // Garante que não cria opção vazia
                        const option = document.createElement('option');
                        option.value = inst;
                        option.textContent = inst;
                        instituicaoSelect.appendChild(option);
                    }
                });
                showSpinner(false);
            })
            .withFailureHandler(handleError)
            .getInstituicoes(sessionToken);

        // Listeners de eventos
        instituicaoSelect.addEventListener('change', onInstituicaoSelected);
        cursoSearchInput.addEventListener('change', onCursoSelected);
        findAlunosBtn.addEventListener('click', onFindAlunos);
        exportTemplateBtn.addEventListener('click', onExportTemplate);
        exportHistoricoBtn.addEventListener('click', onExportHistorico);
    }

</script>