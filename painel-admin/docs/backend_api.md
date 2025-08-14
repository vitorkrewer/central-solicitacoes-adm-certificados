# API do Back-end (Google Apps Script)

Esta secção documenta as funções do lado do servidor que são expostas ao front-end através da API `google.script.run`. Todas as funções requerem um `token` de sessão como primeiro parâmetro para validação.

### Funções Principais (`code.js`)

#### `authenticate(username, clientKey)`
* **Descrição:** Valida as credenciais do utilizador.
* **Parâmetros:**
    * `username` (string): O nome de utilizador.
    * `clientKey` (string): A chave de acesso.
* **Retorna:** `Object` - `{ success: boolean, token: string | null }`.

#### `getSolicitacoes(token)`
* **Descrição:** Busca e retorna todas as solicitações da planilha principal.
* **Retorna:** `Array<Object>` - Uma lista de objetos, onde cada objeto representa uma solicitação.

#### `atualizarStatus(token, protocolo, novoStatus)`
* **Descrição:** Encontra uma solicitação pelo seu protocolo e atualiza o seu status.
* **Retorna:** `string` - Mensagem de sucesso.

#### `atualizarObservacoes(token, protocolo, novasObservacoes)`
* **Descrição:** Atualiza o campo de observações de uma solicitação.
* **Retorna:** `string` - Mensagem de sucesso.

#### `getInstituicoesConfig(token)`
* **Descrição:** Retorna o objeto de configuração `Config.INSTITUICOES` (com CNPJs).
* **Retorna:** `Object` - O objeto de configuração.

### Funções do Módulo de Histórico (`code.js`)

#### `getInstituicoes(token)`
* **Descrição:** Busca uma lista de nomes de instituições únicas a partir da planilha de cursos.
* **Retorna:** `Array<string>` - Lista de nomes de instituições.

#### `getPosGraduacaoCursos(token, instituicao)`
* **Descrição:** Retorna a lista de cursos, filtrada por instituição. Foi utilizado como protótipo para curso de pós-graduação, porém, pode ser adaptado, a depender da particularidades das regras de negócio, a qualquer curso.
* **Retorna:** `Array<Object>` - Lista de objetos de curso.

#### `getHistoricoData(token, cursoId)`
* **Descrição:** Busca os detalhes e a grade curricular de um curso específico.
* **Retorna:** `Object` - `{ cursoDetails: Object, historico: Array<Object> }`.

#### `getAlunosPorCurso(token, nomeCurso, instituicao)`
* **Descrição:** Encontra todos os alunos com status "Concluído" para um determinado curso e instituição.
* **Retorna:** `Array<Object>` - Lista de objetos de aluno.

#### `exportarTemplateHistorico(token, cursoDetails, historico)`
* **Descrição:** Gera uma planilha de histórico apenas com os dados do curso (template).
* **Retorna:** `string` - A URL da nova planilha.

#### `exportarHistorico(token, cursoDetails, historico, alunosSelecionados)`
* **Descrição:** Gera uma planilha de histórico preenchida com os dados dos alunos selecionados.
* **Retorna:** `string` - A URL da nova planilha.

### Funções do Módulo de Declarações (`declaracoes.js` e `code.js`)

#### `getDeclaracaoInstituicoes(token)`
* **Descrição:** Retorna a lista de instituições configuradas no `CONFIG_INSTITUICOES` para o módulo de declarações.
* **Retorna:** `Array<string>` - Nomes das instituições.

#### `getUserData(token, cpf, instituicao)`
* **Descrição:** Busca os dados de um aluno numa API externa.
* **Retorna:** `Object` - Os dados do aluno ou um objeto de erro.

#### `getCursosPorCpf(token, cpf, instituicao)`
* **Descrição:** Busca os cursos de um aluno numa API Redash externa.
* **Retorna:** `Object` - `{ cursos: Array<string> }` ou um objeto de erro.

#### `preencherDadosNaPlanilha(...)`
* **Descrição:** Orquestra a busca de todos os dados necessários (RA, detalhes do curso, etc.) e insere uma nova linha na planilha de declarações.
* **Retorna:** `string` - Mensagem de sucesso.

#### `getDeclaracoes(token, instituicao, tipoDeclaracao)`
* **Descrição:** Busca todas as declarações de um determinado tipo e instituição.
* **Retorna:** `Array<Object>` - Lista de declarações.

#### `gerarDeclaracaoParaLinha(token, instituicao, tipoDeclaracao, rowIndex)`
* **Descrição:** Gera um PDF para uma linha específica da planilha de declarações.
* **Retorna:** `Object` - `{ message: string, pdfUrl: string }`.

#### `enviarDeclaracaoPorEmail(token, instituicao, tipoDeclaracao, rowIndex)`
* **Descrição:** Envia o PDF de uma declaração por e-mail para o aluno.
* **Retorna:** `string` - Mensagem de sucesso.