//Funções que lidam especificamente com exibição ou lógica de modais
    function showDetails(solicitacao) {
        const modalBody = document.getElementById('detailsModalBody');
        const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';
        modalBody.innerHTML = `<h6>Dados Pessoais</h6><p><strong>Nome:</strong> ${solicitacao.nomeCompleto || 'N/A'}</p><p><strong>CPF:</strong> ${solicitacao.cpf || 'N/A'}</p><p><strong>RG:</strong> ${solicitacao.rg || 'N/A'} - ${solicitacao.ufRG || ''}</p><p><strong>Data de Nascimento:</strong> ${formatDate(solicitacao.dataNascimento)}</p><p><strong>Nacionalidade:</strong> ${solicitacao.nacionalidade || 'N/A'}</p><p><strong>Gênero:</strong> ${solicitacao.genero || 'N/A'}</p><h6>Contato</h6><p><strong>E-mail:</strong> ${solicitacao.email || 'N/A'}</p><p><strong>Telefone:</strong> ${solicitacao.telefone || 'N/A'}</p><h6>Curso e Instituição</h6><p><strong>Instituição:</strong> ${solicitacao.instituicao || 'N/A'}</p><p><strong>Curso:</strong> ${solicitacao.nomeDoCurso || 'N/A'}</p><p><strong>Início do Curso:</strong> ${formatDate(solicitacao.inicioDoCurso)}</p><p><strong>Optou por TCC:</strong> ${solicitacao.optouTCC || 'N/A'}</p><h6>Envio e Pagamento</h6><p><strong>Modalidade de Envio:</strong> ${solicitacao.modalidadeEnvio || 'N/A'}</p><p><strong>ID da Transação:</strong> ${solicitacao.idTransacao || 'N/A'}</p><h6>Endereço</h6><p>${solicitacao.cep || ''}, ${solicitacao.endereco || ''}, ${solicitacao.numero || ''}${solicitacao.complemento ? ' - ' + solicitacao.complemento : ''}</p><p>${solicitacao.bairro || ''} - ${solicitacao.cidade || ''} / ${solicitacao.uf || ''}</p><h6>Observações Internas</h6><textarea id="obsTextarea" class="form-control mb-2" rows="4">${solicitacao.observacoes || ''}</textarea><div class="d-flex gap-2"><button class="btn btn-primary btn-sm" onclick="salvarObservacoes('${solicitacao.protocolo}')"><i class="bi bi-save"></i> Salvar Observações</button><button class="btn btn-outline-success btn-sm" onclick='copiarCSVDetalhado(${JSON.stringify(solicitacao)})'><i class="bi bi-clipboard"></i> Copiar CSV</button></div>`;
        detailsModal.show();
    }

function openColumnSelectModal() {
    const modalBody = document.getElementById('column-select-body');
    modalBody.innerHTML = '';
    Object.keys(COLUMN_NAMES).forEach(key => {
        modalBody.innerHTML += `<div class="form-check"><input class="form-check-input" type="checkbox" value="${key}" id="col-check-${key}" checked><label class="form-check-label" for="col-check-${key}">${COLUMN_NAMES[key]}</label></div>`;
    });
    columnSelectModal.show();
}