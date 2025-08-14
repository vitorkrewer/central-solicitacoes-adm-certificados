// Funções que só configuram ou tratam eventos de interface
function setupMainTabListeners() {
    const tabs = document.querySelectorAll('#statusTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            tabs.forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            const viewName = event.target.getAttribute('data-status');
            toggleViews(viewName);
        });
    });
}

function setupSolicitacoesTabListeners() {
    const tabs = document.querySelectorAll('#solicitacoesStatusTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            document.querySelectorAll('#solicitacoesStatusTabs .nav-link').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            activeStatus = event.target.getAttribute('data-status');
            currentPage = 1;
            filterAndDisplayData();
        });
    });
}

document.getElementById('searchInput').addEventListener('keyup', () => {
    currentPage = 1;
    filterAndDisplayData();
});
document.getElementById('rows-per-page').addEventListener('change', () => {
    currentPage = 1;
    filterAndDisplayData();
});


function addListenersToDataTable() {
    document.getElementById('select-all-rows').addEventListener('change', (e) => {
        document.querySelectorAll('.row-selector').forEach(chk => chk.checked = e.target.checked);
        updateCopySelectedButton();
    });

    document.querySelectorAll('.row-selector').forEach(chk => {
        chk.addEventListener('change', updateCopySelectedButton);
    });

    document.querySelectorAll('.copy-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rowIndex = e.currentTarget.getAttribute('data-index');
            const rowData = allData[rowIndex];
            if (!rowData) return;
            const values = Object.keys(COLUMN_NAMES).map(key => `"${rowData[key] || ''}"`);
            const tsvText = values.join('\t');
            navigator.clipboard.writeText(tsvText).then(() => {
                showNotification('Sucesso', 'Linha copiada para a área de transferência.');
            }, () => {
                showNotification('Erro', 'Falha ao copiar a linha.', true);
            });
        });
    });
}

function onInstituicaoSelected() {
    const instituicao = document.getElementById('instituicao-select').value;
    const cursoSearchInput = document.getElementById('curso-search-input');
    const datalist = document.getElementById('cursos-datalist');

    // Reseta o estado da UI
    cursoSearchInput.value = '';
    cursoSearchInput.disabled = true;
    datalist.innerHTML = '';
    document.getElementById('historico-main-content').style.display = 'none';

    if (!instituicao) return;

    showSpinner(true);
    google.script.run
        .withSuccessHandler(cursos => {
            cursosCache = cursos || []; // Armazena os cursos no cache
            datalist.innerHTML = '';
            cursosCache.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.nome_curso_completo;
                // Adiciona um data attribute para guardar o ID
                option.dataset.id = curso.id_curso;
                datalist.appendChild(option);
            });
            cursoSearchInput.disabled = false;
            showSpinner(false);
        })
        .withFailureHandler(handleError)
        .getPosGraduacaoCursos(sessionToken, instituicao); // Passa a instituição como filtro
}

function onCursoSelected() {
    const cursoNome = document.getElementById('curso-search-input').value;
    const datalistOptions = document.getElementById('cursos-datalist').options;
    let cursoSelecionado = null;

    // Lógica para encontrar o curso selecionado no datalist. Garante que tenhamos o ID correto para buscar os detalhes.
    for (let i = 0; i < datalistOptions.length; i++) {
        if (datalistOptions[i].value === cursoNome) {
            cursoSelecionado = cursosCache.find(c => c.id_curso === datalistOptions[i].dataset.id);
            break;
        }
    }

    document.getElementById('aluno-selection-container').style.display = 'none';
    document.getElementById('aluno-list').innerHTML = '';
    document.getElementById('export-historico-btn').disabled = true;

    if (!cursoSelecionado) {
        document.getElementById('historico-main-content').style.display = 'none';
        return;
    }

    const cursoId = cursoSelecionado.id_curso;
    showSpinner(true);
    document.getElementById('historico-main-content').style.display = 'none';

    // Esta chamada agora funcionará, pois o cursoId é válido.
    google.script.run
        .withSuccessHandler(data => {
            historicoDataCache = data;
            renderCursoDetails(data.cursoDetails);
            renderHistoricoTable(data.historico);
            document.getElementById('historico-main-content').style.display = 'block';
            showSpinner(false);
        })
        .withFailureHandler(handleError)
        .getHistoricoData(sessionToken, cursoId);
}

function onFindAlunos() {
    const instituicao = document.getElementById('instituicao-select').value;
    const nomeCurso = document.getElementById('curso-search-input').value;

    if (!instituicao || !nomeCurso) {
        handleError({ message: "Selecione uma instituição e um curso válidos primeiro." });
        return;
    }

    const container = document.getElementById('aluno-selection-container');
    showSpinner(true);
    container.style.display = 'none';

    google.script.run
        .withSuccessHandler(alunos => {
            renderAlunosList(alunos);
            container.style.display = 'block';
            showSpinner(false);
        })
        .withFailureHandler(handleError)
        .getAlunosPorCurso(sessionToken, nomeCurso, instituicao);
}

function onExportTemplate() {
    if (!historicoDataCache || !historicoDataCache.cursoDetails) {
        handleError({ message: "Selecione um curso para exportar o template." });
        return;
    }
    showSpinner(true);
    const { cursoDetails, historico } = historicoDataCache;

    google.script.run
        .withSuccessHandler(fileUrl => {
            showSpinner(false);
            showNotification(
                'Template Exportado!',
                'Template gerado com sucesso.', // A mensagem é simples.
                fileUrl                      // O link é passado separadamente.
            );
        })
        .withFailureHandler(handleError)
        .exportarTemplateHistorico(sessionToken, cursoDetails, historico);
}

function onExportHistorico() {
    showSpinner(true);
    const selectedAlunos = [];
    document.querySelectorAll('#aluno-list .form-check-input:checked').forEach(chk => {
        selectedAlunos.push(JSON.parse(chk.getAttribute('data-aluno-obj')));
    });

    if (selectedAlunos.length === 0) {
        handleError({ message: "Nenhum aluno selecionado para exportação." });
        return;
    }

    const { cursoDetails, historico } = historicoDataCache;

    google.script.run
        .withSuccessHandler(fileUrl => {
            showSpinner(false);
            showNotification(
                'Exportação Concluída!',
                'Histórico gerado com sucesso.', // A mensagem.
                fileUrl                         // O link.
            );
        })
        .withFailureHandler(handleError)
        .exportarHistorico(sessionToken, cursoDetails, historico, selectedAlunos);
}

// --- LÓGICA DA ABA DE DECLARAÇÕES ---
function inicializarAbaDeclaracoes() {
    const selectInserir = document.getElementById('inserir-declaracao-instituicao-select');
    const selectView = document.getElementById('view-declaracao-instituicao-select');
    
    if (selectView.options.length > 1) return;
    
    google.script.run
        .withSuccessHandler(instituicoes => {
            selectInserir.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            selectView.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            if (instituicoes && instituicoes.length > 0) {
                instituicoes.forEach(nome => {
                    selectInserir.add(new Option(nome, nome));
                    selectView.add(new Option(nome, nome));
                });
            }
        })
        .withFailureHandler(handleError)
        .getDeclaracaoInstituicoes(sessionToken);
}

function carregarDadosDeclaracoes() {
    const instituicao = document.getElementById('view-declaracao-instituicao-select').value;
    const activeTab = document.querySelector('#declarations-type-tabs .nav-link.active');
    
    if (!instituicao || !activeTab) return;

    const tipoDeclaracao = activeTab.getAttribute('data-type');
    showSpinner(true);
    const tableBody = document.getElementById('declarations-table-body');
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center">Carregando...</td></tr>';

    google.script.run
        .withSuccessHandler(data => {
            renderDeclarationsTable(data, instituicao, tipoDeclaracao);
            showSpinner(false);
        })
        .withFailureHandler(handleError)
        .getDeclaracoes(sessionToken, instituicao, tipoDeclaracao);
}

// Adiciona os Listeners para a tabela de visualização
document.getElementById('view-declaracao-instituicao-select').addEventListener('change', carregarDadosDeclaracoes);
document.getElementById('refresh-declarations-btn').addEventListener('click', carregarDadosDeclaracoes);
document.querySelectorAll('#declarations-type-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', (event) => {
        document.querySelectorAll('#declarations-type-tabs .nav-link').forEach(t => t.classList.remove('active'));
        event.currentTarget.classList.add('active');
        carregarDadosDeclaracoes();
    });
});


// --- RENDERIZAÇÃO E AÇÕES DA TABELA DE DECLARAÇÕES ---
function renderDeclarationsTable(data, instituicao, tipoDeclaracao) {
    const tableHead = document.getElementById('declarations-table-head');
    const tableBody = document.getElementById('declarations-table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">Nenhuma declaração encontrada.</td></tr>';
        return;
    }

    const headers = Object.keys(data[0]).filter(h => h !== 'rowIndex');
    tableHead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}<th>Ações</th></tr>`;

    data.forEach(row => {
        const tr = document.createElement('tr');
        let rowHtml = '';
        headers.forEach(header => {
            if (header === 'ID DOC' && (row[header] || '').startsWith('http')) {
                rowHtml += `<td><a href="${row[header]}" target="_blank" title="${row[header]}">Link</a></td>`;
            } else {
                rowHtml += `<td>${row[header] || ''}</td>`;
            }
        });

        const idDocUrl = row['ID DOC'];
        const statusGerador = row['Gerador'];
        const statusEnvio = row['Envio por Email'];
        let actionButtonsHtml = '<div class="btn-group" role="group">';

        if ((idDocUrl || '').startsWith('http')) {
            // Se o PDF já foi gerado
            actionButtonsHtml += `<a href="${idDocUrl}" target="_blank" class="btn btn-success btn-sm" title="Abrir PDF"><i class="bi bi-box-arrow-up-right"></i></a>`;
            
            if (statusEnvio && statusEnvio.startsWith('Enviado')) {
                actionButtonsHtml += `<button class="btn btn-outline-secondary btn-sm" disabled title="${statusEnvio}"><i class="bi bi-check-lg"></i> Enviado</button>`;
            } else {
                actionButtonsHtml += `<button class="btn btn-info btn-sm" title="Enviar por E-mail" onclick="handleEnviarEmail(this, '${instituicao}', '${tipoDeclaracao}', ${row.rowIndex})"><i class="bi bi-envelope-fill"></i></button>`;
            }
        } else if (statusGerador === 'Emitir') {
            // Se o PDF ainda não foi gerado
            actionButtonsHtml += `<button class="btn btn-primary btn-sm" onclick="handleGerarDeclaracao(this, '${instituicao}', '${tipoDeclaracao}', ${row.rowIndex})"><i class="bi bi-file-earmark-arrow-down-fill"></i> Gerar PDF</button>`;
        } else {
             actionButtonsHtml = `<span class="badge bg-secondary">${statusGerador || 'Pendente'}</span>`;
        }
        
        actionButtonsHtml += '</div>';
        tr.innerHTML = `${rowHtml}<td>${actionButtonsHtml}</td>`;
        tableBody.appendChild(tr);
    });
}


function handleEnviarEmail(button, instituicao, tipoDeclaracao, rowIndex) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    google.script.run
        .withSuccessHandler(response => {
            showNotification('Sucesso!', response, false);
            carregarDadosDeclaracoes(); // Atualiza a tabela para mostrar o status "Enviado"
        })
        .withFailureHandler(error => {
            handleError(error);
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-envelope-fill"></i>';
        })
        .enviarDeclaracaoPorEmail(sessionToken, instituicao, tipoDeclaracao, rowIndex);
}

// Função chamada pelo clique no botão "Gerar PDF"
function handleGerarDeclaracao(button, instituicao, tipoDeclaracao, rowIndex) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Gerando...';

    google.script.run
        .withSuccessHandler(response => {
            showNotification('Sucesso!', response.message, false);
            carregarDadosDeclaracoes(); // Atualiza a tabela
        })
        .withFailureHandler(error => {
            handleError(error);
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-file-earmark-arrow-down-fill"></i> Gerar PDF';
        })
        .gerarDeclaracaoParaLinha(sessionToken, instituicao, tipoDeclaracao, rowIndex);
}

let userDataFromApi = null; // Variável para guardar os dados da API

// Função para buscar dados do aluno
function buscarDadosNovoAluno() {
    const instituicao = document.getElementById('inserir-declaracao-instituicao-select').value;
    const cpf = document.getElementById('cpf-declaracao').value;

    if (!instituicao || !cpf) {
        showNotification('Atenção', 'Por favor, selecione uma instituição e insira um CPF.', true);
        return;
    }
    showSpinner(true);
    document.getElementById('dados-aluno-container').style.display = 'none';

    google.script.run
        .withSuccessHandler(apiData => {
            if (apiData.error) {
                showSpinner(false);
                showNotification('Erro', apiData.error, true);
                return;
            }
            userDataFromApi = apiData;
            document.getElementById('nome-declaracao').textContent = apiData.name;
            document.getElementById('cpf-exibido-declaracao').textContent = apiData.document;
            document.getElementById('email-declaracao').textContent = apiData.email;
            
            google.script.run
                .withSuccessHandler(cursosResult => {
                    showSpinner(false);
                    if (cursosResult.error) {
                        showNotification('Erro ao buscar cursos', cursosResult.error, true);
                    } else if (cursosResult.cursos && cursosResult.cursos.length > 0) {
                        const selectCursos = document.getElementById('cursos-declaracao');
                        selectCursos.innerHTML = '';
                        cursosResult.cursos.forEach(curso => selectCursos.add(new Option(curso, curso)));
                        document.getElementById('dados-aluno-container').style.display = 'block';
                    } else {
                        showNotification('Aviso', 'Nenhum curso encontrado para este aluno.', false);
                    }
                })
                .withFailureHandler(handleError)
                .getCursosPorCpf(sessionToken, cpf, instituicao); 

        })
        .withFailureHandler(handleError)
        .getUserData(sessionToken, cpf, instituicao);
}

// Função para inserir os dados na planilha
function preencherNovaDeclaracao() {
    if (!userDataFromApi) {
        showNotification('Erro', 'Busque os dados do aluno primeiro.', true);
        return;
    }
    const instituicao = document.getElementById('inserir-declaracao-instituicao-select').value;
    const curso = document.getElementById('cursos-declaracao').value;
    const tipoDeclaracao = document.getElementById('tipo-declaracao-select').value;
    const cpf = document.getElementById('cpf-declaracao').value;

    if (!curso) {
        showNotification('Atenção', 'Por favor, selecione um curso.', true);
        return;
    }
    showSpinner(true);

    google.script.run
        .withSuccessHandler(successMessage => {
            showSpinner(false);
            showNotification('Sucesso!', successMessage, false);
            document.getElementById('cpf-declaracao').value = '';
            document.getElementById('dados-aluno-container').style.display = 'none';
            bootstrap.Collapse.getInstance(document.getElementById('collapse-nova-declaracao')).hide();
            carregarDadosDeclaracoes();
        })
        .withFailureHandler(handleError)
        .preencherDadosNaPlanilha(sessionToken, cpf, curso, userDataFromApi, tipoDeclaracao, instituicao);
}

// Adiciona os Listeners para o formulário de inserção
document.getElementById('buscar-dados-declaracao-btn').addEventListener('click', buscarDadosNovoAluno);
document.getElementById('preencher-declaracao-btn').addEventListener('click', preencherNovaDeclaracao);


function buscarDadosDeclaracao() {
    // Adicione um seletor para o dropdown de instituições na sua aba de Declarações
    const instituicao = document.getElementById('instituicao-declaracao-select').value;
    const cpf = document.getElementById('cpf-declaracao').value;

    if (!instituicao) {
        showNotification('Atenção', 'Por favor, selecione uma instituição.', true);
        return;
    }
    if (!cpf) {
        showNotification('Atenção', 'Por favor, insira um CPF.', true);
        return;
    }

    showSpinner(true);
    document.getElementById('dados-usuario-declaracao').style.display = 'none';
    document.getElementById('campos-preenchimento').style.display = 'none';

    // Chama a nova função do backend, passando o token e a instituição
    google.script.run
        .withSuccessHandler(apiData => {
            if (apiData.error) {
                showNotification('Erro', apiData.error, true);
                showSpinner(false);
                return;
            }

            // Guarda os dados para uso posterior (como no preenchimento da planilha)
            userDataFromApi = apiData;

            // Preenche os campos da UI com os dados da API
            document.getElementById('nome-declaracao').textContent = apiData.name;
            document.getElementById('cpf-exibido-declaracao').textContent = apiData.document;
            document.getElementById('email-declaracao').textContent = apiData.email;
            document.getElementById('dados-usuario-declaracao').style.display = 'block';

            // Com os dados do usuário em mãos, agora busca os cursos para este CPF
            google.script.run
                .withSuccessHandler(cursosResult => {
                    showSpinner(false);
                    if (cursosResult.error) {
                        showNotification('Erro ao buscar cursos', cursosResult.error, true);
                    } else if (cursosResult.cursos && cursosResult.cursos.length > 0) {
                        const selectCursos = document.getElementById('cursos-declaracao');
                        selectCursos.innerHTML = '';
                        cursosResult.cursos.forEach(curso => {
                            selectCursos.add(new Option(curso, curso));
                        });
                        document.getElementById('campos-preenchimento').style.display = 'block';
                    } else {
                        showNotification('Aviso', 'Nenhum curso encontrado para este aluno.', false);
                    }
                })
                .withFailureHandler(handleError)
                .getCursosPorCpf(sessionToken, cpf); // Passa o token de sessão

        })
        .withFailureHandler(handleError)
        .getUserData(sessionToken, cpf, instituicao); // Passa o token, cpf e instituição
}

function preencherDeclaracao() {
    // Validação inicial: verifica se os dados da API foram carregados
    if (!userDataFromApi) {
        showNotification('Erro', 'Dados do usuário não foram carregados. Busque por CPF primeiro.', true);
        return;
    }

    // 1. Coleta TODOS os dados do formulário
    const instituicao = document.getElementById('instituicao-declaracao-select').value;
    const curso = document.getElementById('cursos-declaracao').value;
    const tipoDeclaracao = document.getElementById('tipo-declaracao').value;
    const cpf = document.getElementById('cpf-declaracao').value;

    // Valida se um curso foi selecionado
    if (!curso) {
        showNotification('Atenção', 'Por favor, selecione um curso.', true);
        return;
    }

    showSpinner(true);

    // 2. Chama a função de back-end com TODOS os parâmetros necessários
    google.script.run
        .withSuccessHandler(function(successMessage) {
            showSpinner(false);
            // Mostra a notificação de sucesso retornada pelo back-end
            showNotification('Sucesso!', successMessage, false); 
            
            // 3. Limpa o formulário para a próxima consulta
            document.getElementById('cpf-declaracao').value = '';
            document.getElementById('instituicao-declaracao-select').value = '';
            document.getElementById('dados-usuario-declaracao').style.display = 'none';
            document.getElementById('campos-preenchimento').style.display = 'none';
            userDataFromApi = null; // Reseta a variável de cache
        })
        .withFailureHandler(handleError) // Reutiliza seu handler de erro genérico
        .preencherDadosNaPlanilha(
            sessionToken, 
            cpf, 
            curso, 
            userDataFromApi, 
            tipoDeclaracao, 
            instituicao
        );
}