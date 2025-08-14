# Estrutura da Base de Dados e Fluxo de Dados

Este documento detalha a arquitetura de dados do Painel de Administração de Solicitação de Certificados, incluindo as Planilhas Google utilizadas como base de dados, a estrutura das suas abas e colunas, e como os dados são consumidos através das APIs externas como as do Redash utilizados neste projeto.

## Visão Geral do Fluxo de Dados

O sistema opera com um modelo híbrido:

1.  **Planilhas Google (Google Sheets):** Atuam como a base de dados principal (fonte de verdade) para registos de solicitações, configurações de cursos e históricos. São o repositório onde os dados processados são armazenados.
2.  **APIs Externas:** São utilizadas para buscar dados dinâmicos e em tempo real que não estão armazenados diretamente no painel, como informações de utilizadores e matrículas de cursos. Isto garante que os dados estão sempre atualizados no momento da consulta. Neste projeto foi utilizada APIs do Redash.

---

## 1. Planilhas Google (Base de Dados)

As seguintes planilhas são essenciais para o funcionamento da aplicação. Os seus IDs são configurados no ficheiro `config.js`.

### a. Planilha de Solicitações de Certificados
* **Finalidade:** Armazena todas as solicitações de certificados de conclusão de curso feitas pelos alunos.
* **ID em `config.js`:** `ID_SOLICITACOES`
* **Aba Obrigatória:** `solicitacoes`
    * **Colunas (`HEADERS.SOLICITACOES`):**
        * `protocolo`, `timestamp`, `nome`, `cpf`, `rg`, `ufRG`, `dataNascimento`, `nacionalidade`, `genero`, `email`, `telefone`, `instituicao`, `curso`, `inicioCurso`, `optouTCC`, `modalidadeEnvio`, `idTransacao`, `cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `status`, `observacoes`

### b. Planilha de Gestão de Cursos
* **Finalidade:** Base de dados central para todos os cursos e as suas respetivas grades curriculares.
* **ID em `config.js`:** `ID_CURSOS`
* **Abas Obrigatórias:**
    1.  `cursos`
        * **Finalidade:** Lista mestra de todos os cursos oferecidos.
        * **Colunas Essenciais (`HEADERS.CURSOS`):** `id_curso`, `nome_curso_simples`, `nome_curso_completo`, `status`, `instituicao`, `area_conhecimento`, etc.
    2.  `historicos.pos`
        * **Finalidade:** Armazena a grade curricular (disciplinas) de cada curso.
        * **Colunas Essenciais (`HEADERS.HISTORICOS_CURSO`):** `id_curso`, `curso`, `instituicao`, `disciplina`, `carga_horaria`, `professor`, `titulacao`

### c. Planilhas de Declarações (Uma por Instituição)
* **Finalidade:** Cada instituição tem a sua própria planilha para gerir o fluxo de declarações e os dados de matrículas importados.
* **IDs em `config.js`:** `ID_DECLARACOES_INSTITUICAO_1`, `ID_DECLARACOES_INSTITUICAO_2`
* **Abas Obrigatórias em Cada Planilha:**
    1.  `declaracoes_matricula` e `declaracoes_conclusao`
        * **Finalidade:** Armazena as declarações inseridas através do painel.
        * **Colunas (`HEADERS.DECLARACOES_...`):** `Nome Completo`, `CPF`, `E-mail`, `Número de Matrícula`, `Nome do Curso`, `Data de Início`, `Data de Conclusão`, `Carga horária`, `Área de conhecimento`, `Emissão`, `Gerador`, `Envio por Email`, `ID DOC`, `CodigoAleatorio`
    2.  `matriculas_alunos_instituicao_1` / `matriculas_alunos_instituicao_2`
        * **Finalidade:** Repositório dos dados de matrículas importados via API. Utilizado para cruzar informações de cursos.
        * **Colunas Essenciais:** `aluno_id`, `nome_aluno`, `cpf`, `email`, `nome_curso`, `carga_horaria`, `data_matricula`, `data_conclusao`, `instituicao`
    3.  `alunos.ra`
        * **Finalidade:** Repositório dos RAs (Registos acadêmicos) dos alunos, importados via API.
        * **Colunas Essenciais:** `cpf`, `code` (RA do aluno)

---

## 2. Consumo de Dados via API

O sistema consome dados de APIs externas para obter informações em tempo real. As configurações para estas APIs estão no ficheiro `constants.js`, dentro do objeto `CONFIG_INSTITUICOES`.

### a. API de Dados do Aluno
* **Finalidade:** Buscar os dados cadastrais de um aluno (nome, e-mail, etc.) pelo CPF.
* **Função no Back-end:** `getUserData(token, cpf, instituicao)`
* **Configuração em `constants.js`:** A chave `apiUrl` dentro de cada instituição.
    * **Exemplo:** `"apiUrl": "https://link.da.sua.api/institutions/cnpjaqui/users/"`
* **Fluxo:**
    1.  O utilizador digita um CPF no painel.
    2.  A função `getUserData` é chamada.
    3.  O código busca a `apiUrl` correspondente à instituição selecionada.
    4.  O CPF é concatenado ao final da URL (`.../users/CPF_DO_ALUNO`).
    5.  É feita uma requisição `GET` a esta URL.
    6.  A resposta (um objeto JSON com os dados do aluno) é retornada para o painel.

### b. API de Matrículas (Cursos do Aluno)
* **Finalidade:** Obter a lista de cursos em que um aluno está matriculado numa determinada instituição.
* **Função no Back-end:** `getCursosPorCpf(token, cpf, instituicao)`
* **Configuração em `constants.js`:** O objeto `importacao.matriculas` (`queryId`, `apiKey`).
    * **Exemplo:** `matriculas: { queryId: 342, apiKey: "..." }`
* **Fluxo:**
    1.  Após a busca dos dados do aluno, a função `getCursosPorCpf` é chamada.
    2.  O código busca o `queryId` e a `apiKey` de matrículas para a instituição selecionada.
    3.  Constrói a URL da API Redash: `.../api/queries/QUERY_ID/results.csv?api_key=API_KEY`.
    4.  A API retorna um ficheiro CSV com todas as matrículas daquela instituição.
    5.  O back-end processa o CSV, filtra as linhas pelo CPF do aluno e retorna uma lista dos seus cursos.

### c. API de RAs (Número de Matrícula)
* **Finalidade:** Obter o RA (Registro acadêmico ou Número de Matrícula) de um aluno.
* **Função no Back-end:** `getAlunoRA(token, cpf, instituicao)`
* **Configuração em `constants.js`:** O objeto `importacao.ras` (`queryId`, `apiKey`).
    * **Exemplo:** `ras: { queryId: 356, apiKey: "..." }`
* **Fluxo:**
    1.  Quando o utilizador clica em "Inserir na Planilha", a função `preencherDadosNaPlanilha` é chamada.
    2.  A primeira ação desta função é chamar `getAlunoRA`.
    3.  O código busca o `queryId` e a `apiKey` de RAs para a instituição selecionada.
    4.  Constrói a URL da API Redash: `.../api/queries/QUERY_ID/results.json?api_key=API_KEY`.
    5.  A API retorna um JSON com os RAs de todos os alunos.
    6.  O back-end processa o JSON, encontra a linha correspondente ao CPF e retorna o valor do campo `code` (o RA).