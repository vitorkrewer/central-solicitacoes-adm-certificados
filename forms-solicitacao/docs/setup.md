# Guia de Instalação e Configuração

Siga estes passos para configurar e implementar o Formulário de Solicitação no seu ambiente Google Workspace.

### Pré-requisitos

1.  Uma conta Google (preferencialmente Google Workspace).
2.  Acesso ao Google Drive e Planilhas Google.
3.  Os ficheiros de código-fonte do projeto (`code.js` e `solicitacao.html`).

### Passo 1: Configurar a Planilha de Destino

O formulário envia os dados para a mesma planilha utilizada pelo Painel de Administração.

1.  **Identifique a Planilha de Solicitações:** Certifique-se de que a planilha principal de solicitações está criada.
2.  **Verifique as Abas:** A planilha deve conter duas abas essenciais para este formulário:
    * **`solicitacoes`**: Para onde os dados do formulário serão gravados. As colunas devem corresponder à ordem definida na função `salvarDados` em `code.js`.
    * **`lista.cursos`**: Uma aba com duas colunas: "Instituição" (Coluna A) e "Curso" (Coluna B). Esta lista é usada para popular dinamicamente os menus dropdown do formulário.
3.  **Anote o ID da Planilha:** Copie o ID da sua planilha a partir da URL (`.../spreadsheets/d/ID_DA_PLANILHA/edit`).

### Passo 2: Criar e Configurar o Projeto Apps Script

1.  **Crie o Projeto:** Aceda a [script.google.com](https://script.google.com) e crie um novo projeto. Dê-lhe um nome (ex: "Formulário de Solicitação").
2.  **Crie os Ficheiros:**
    * Renomeie o ficheiro `Código.gs` para `code.gs`. Cole o conteúdo do seu `code.js` nele.
    * Crie um novo ficheiro **HTML** (`Ficheiro > Novo > Ficheiro HTML`) e nomeie-o `solicitacao`. Cole o conteúdo do seu `solicitacao.html` nele.
3.  **Configure as Constantes em `code.gs`**:
    * Abra o ficheiro `code.gs`.
    * Na constante `SPREADSHEET_ID`, cole o ID da sua planilha que anotou no Passo 1.
    * Verifique se os nomes das abas (`SHEET_NAME` e `COURSE_LIST_SHEET_NAME`) correspondem aos nomes exatos na sua planilha.
    * Atualize os `paymentLinks` na função `getPaymentLinks()` com os URLs corretos para a sua operação. (Opcional).

### Passo 3: Implementar a Aplicação Web (Deploy)

1.  No canto superior direito do editor, clique em **Implementar > Nova implementação**.
2.  Clique no ícone de engrenagem e selecione o tipo **"Aplicação web"**.
3.  Preencha as seguintes configurações:
    * **Descrição:** (Opcional) Adicione uma descrição (ex: "Versão inicial do formulário").
    * **Executar como:** `Eu` (a sua conta Google).
    * **Quem tem acesso:** **`Qualquer pessoa`**. Isto é crucial para que os alunos possam aceder ao formulário publicamente.
4.  Clique em **Implementar**.
5.  O Google irá pedir autorização para que o script aceda às suas Planilhas Google. Aprove as permissões.
6.  Após a implementação, será fornecida uma **URL da aplicação web**. Esta é a URL pública do seu formulário.

O seu Formulário de Solicitação está agora online e a enviar dados diretamente para a planilha do seu Painel de Administração.