const cursosData = <?!= JSON.stringify(cursosData) ?>;
const paymentLinks = <?!= JSON.stringify(paymentLinks) ?>;

function populateUFs() {
    const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
    const selectUF = document.getElementById('uf');
    const selectUfRG = document.getElementById('ufRG');
    selectUF.innerHTML = '<option value="">--</option>';
    selectUfRG.innerHTML = '<option value="" selected disabled>-- UF --</option>';
    ufs.forEach(uf => {
        const option = `<option value="${uf}">${uf}</option>`;
        selectUF.innerHTML += option;
        selectUfRG.innerHTML += option;
    });
}

function populateInstituicoes() {
    const select = document.getElementById('instituicao');
    const instituicoes = Object.keys(cursosData).sort();
    instituicoes.forEach(inst => {
        select.innerHTML += `<option value="${inst}">${inst}</option>`;
    });
}

function handleInstituicaoChange() {
    const instituicaoSelecionada = this.value;
    const cursoSelect = document.getElementById('curso');
    cursoSelect.innerHTML = '<option value="" selected disabled>-- Escolha seu curso --</option>';
    cursoSelect.disabled = true;
    if (instituicaoSelecionada && cursosData[instituicaoSelecionada]) {
        const cursos = cursosData[instituicaoSelecionada].sort();
        cursos.forEach(curso => {
            cursoSelect.innerHTML += `<option value="${curso}">${curso}</option>`;
        });
        cursoSelect.disabled = false;
    }
    updatePaymentButton();
}

function handleModalidadeChange() {
    const isRetirada = document.getElementById('modalidadeRetirada').checked;
    const isCorreios = document.getElementById('modalidadeCorreios').checked;
    const isPaidOption = isRetirada || isCorreios;
    document.getElementById('idTransacaoWrapper').style.display = isPaidOption ? 'block' : 'none';
    document.getElementById('idTransacao').required = isPaidOption;
    document.getElementById('dadosEnvio').style.display = isCorreios ? 'block' : 'none';
    const addressFields = ['cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf'];
    addressFields.forEach(fieldId => {
        document.getElementById(fieldId).required = isCorreios;
    });
    updatePaymentButton();
}

function updatePaymentButton() {
    const instituicao = document.getElementById('instituicao').value;
    const isRetirada = document.getElementById('modalidadeRetirada').checked;
    const isCorreios = document.getElementById('modalidadeCorreios').checked;
    const paymentWrapper = document.getElementById('paymentLinkWrapper');
    const paymentButton = document.getElementById('paymentButton');
    paymentWrapper.style.display = 'none';
    paymentButton.href = '#';
    if (!instituicao) return;
    let paymentType = null;
    if (isCorreios) { paymentType = "Correios"; }
    else if (isRetirada) { paymentType = "Retirada"; }
    if (paymentType && paymentLinks[instituicao] && paymentLinks[instituicao][paymentType]) {
        paymentButton.href = paymentLinks[instituicao][paymentType];
        paymentWrapper.style.display = 'block';
    }
}

function checkCourseDuration() {
    const startDateInput = document.getElementById('inicioCurso');
    const tccRadio = document.querySelector('input[name="optouTCC"]:checked');
    const warningDiv = document.getElementById('durationWarning');
    if (!startDateInput.value || !tccRadio) {
        warningDiv.style.display = 'none';
        return;
    }
    const requiredMonths = tccRadio.value === 'Sim' ? 6 : 4;
    const startDate = new Date(startDateInput.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(startDate.getTime());
    targetDate.setMonth(targetDate.getMonth() + requiredMonths);
    if (targetDate > today) {
        warningDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <strong>Atenção Acadêmico(a):</strong> você ainda não atingiu o tempo mínimo de <strong>${requiredMonths} meses</strong> para conclusão do curso. Seu pedido poderá ser indeferido pela secretaria acadêmica.`;
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
    }
}

function showSuccess(response) {
    const form = document.getElementById('certificateForm');
    const responseDiv = document.getElementById('response-message');
    responseDiv.style.display = 'block';
    responseDiv.className = 'alert alert-success mt-4';
    responseDiv.innerHTML = `<strong>${response.message}</strong><br>Seu número de protocolo é: <strong>${response.protocolo}</strong>. Guarde este número para futuras consultas.`;
    form.style.display = 'none';
    document.getElementById('infoAccordion').style.display = 'none';
    window.scrollTo(0, 0);
}

function showError(error) {
    const submitButton = document.getElementById('submitButton');
    const spinner = document.getElementById('spinner');
    const responseDiv = document.getElementById('response-message');
    submitButton.disabled = false;
    spinner.style.display = 'none';
    responseDiv.style.display = 'block';
    responseDiv.className = 'alert alert-danger mt-4';
    responseDiv.innerHTML = `<strong>Erro:</strong> ${error.message}. Por favor, verifique os dados e tente novamente.`;
    window.scrollTo(0, 0);
}

// --- CONFIGURAÇÃO DOS EVENT LISTENERS ---

// Listener único para o envio do formulário
document.getElementById('certificateForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const modalidades = document.querySelectorAll('input[name="modalidadeEnvio"]:checked');
    if (modalidades.length === 0) {
        showError({ message: "Você precisa selecionar pelo menos uma modalidade de envio do certificado." });
        return;
    }
    const submitButton = document.getElementById('submitButton');
    const spinner = document.getElementById('spinner');
    submitButton.disabled = true;
    spinner.style.display = 'inline-block';
    const modalidadesSelecionadas = Array.from(modalidades).map(cb => cb.value);
    const formData = {
        nome: this.nome.value, cpf: this.cpf.value, rg: this.rg.value, ufRG: this.ufRG.value,
        dataNascimento: this.dataNascimento.value, nacionalidade: this.nacionalidade.value,
        genero: this.genero.value, email: this.email.value, telefone: this.telefone.value,
        instituicao: this.instituicao.value, curso: this.curso.value, inicioCurso: this.inicioCurso.value,
        optouTCC: this.querySelector('input[name="optouTCC"]:checked').value,
        modalidadeEnvio: modalidadesSelecionadas, idTransacao: this.idTransacao.value,
        cep: this.cep.value, endereco: this.endereco.value, numero: this.numero.value,
        complemento: this.complemento.value, bairro: this.bairro.value,
        cidade: this.cidade.value, uf: this.uf.value,
    };
    google.script.run
        .withSuccessHandler(showSuccess)
        .withFailureHandler(showError)
        .salvarDados(formData);
});

// Outros listeners
document.getElementById('instituicao').addEventListener('change', handleInstituicaoChange);
document.querySelectorAll('input[name="modalidadeEnvio"]').forEach(elem => {
    elem.addEventListener('change', handleModalidadeChange);
});
document.getElementById('inicioCurso').addEventListener('change', checkCourseDuration);
document.querySelectorAll('input[name="optouTCC"]').forEach(elem => {
    elem.addEventListener('change', checkCourseDuration);
});

// Função que é executada quando a página carrega
window.onload = function () {
    populateUFs();
    populateInstituicoes();
    handleModalidadeChange();
};