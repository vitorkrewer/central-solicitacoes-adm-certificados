# Guia de Instalação e Configuração

Siga estes passos para configurar e implementar o Painel de Administração no seu próprio ambiente Google Workspace.

### Pré-requisitos

1.  Uma conta Google (preferencialmente uma conta Google Workspace).
2.  Acesso ao Google Drive, Planilhas Google e Gmail.
3.  Os ficheiros de código-fonte do projeto.

### Passo 1: Configurar as Planilhas Google

A aplicação utiliza várias Planilhas Google como base de dados. Crie ou identifique as seguintes planilhas na sua conta:

1.  **Planilha de Solicitações:** Armazena os pedidos de certificados.
2.  **Planilha de Gestão de Cursos:** Contém as abas `cursos` e `historicos.cursos`.
3.  **Planilhas de Declarações:** Uma para cada instituição (ex: `Declarações Instituição 1`, `Declarações Instituição 2`). Cada uma deve conter:
    * Uma aba para matrículas (ex: `declaracoes_matricula`).
    * Uma aba para matrículas importadas (ex: `matriculas_alunos_instituicao_1`).
    * Uma aba para RAs importados (ex: `alunos.ra`).

**Ação:** Anote o ID de cada uma destas planilhas. O ID pode ser encontrado na URL (`.../spreadsheets/d/ID_DA_PLANILHA/edit`).

### Passo 2: Criar o Projeto Google Apps Script

1.  Aceda a [script.google.com](https://script.google.com) e crie um novo projeto.
2.  Dê um nome ao projeto (ex: "Painel de Administração").
3.  Apague o conteúdo do ficheiro `Code.gs` padrão.
4.  Crie todos os ficheiros `.js` e `.html` do projeto (`code.js`, `declaracoes.js`, `config.js`, `constants.js`, `admin-ui.html`, etc.) e copie o conteúdo de cada ficheiro do código-fonte para o ficheiro correspondente no editor do Apps Script.

### Passo 3: Configurar os Ficheiros de Ambiente

1.  **`config.js`**:
    * Abra o ficheiro `config.js` no editor.
    * Preencha os IDs das planilhas que você anotou no Passo 1 nas respetivas chaves em `Config.SHEETS`.
    * Preencha os IDs dos seus documentos modelo do Google Docs em `Config.DOCS`.

2.  **`constants.js`**:
    * Abra o ficheiro `constants.js`.
    * Verifique se a secção `CONFIG_INSTITUICOES` está corretamente preenchida com os nomes das suas instituições, `apiUrl`, configurações de `importacao` e `folder_id`.

### Passo 4: Configurar a Autenticação

1.  **`setupUserKeys.js`**:
    * Abra o ficheiro `setupUserKeys.js`.
    * Edite a lista `users` para adicionar os utilizadores e as chaves de acesso que você deseja.
2.  **Executar a Configuração**:
    * No editor do Apps Script, selecione a função `setupUserKeys` na barra de ferramentas.
    * Clique em **Executar**.
    * Você precisará de autorizar as permissões do script na primeira vez.

### Passo 5: Configurar o Manifesto (`appsscript.json`)

1.  No editor, vá a **Configurações do projeto > Mostrar ficheiro de manifesto "appsscript.json" no editor**.
2.  Abra o ficheiro `appsscript.json` e certifique-se de que o seu conteúdo corresponde ao do ficheiro `appsscript.json` do projeto. Os `oauthScopes` são particularmente importantes para garantir que o script tem as permissões necessárias para funcionar.

### Passo 6: Implementar a Aplicação Web (Deploy)

1.  No canto superior direito do editor, clique em **Implementar > Nova implementação**.
2.  Selecione o tipo de implementação clicando no ícone de engrenagem e escolhendo **"Aplicação web"**.
3.  Preencha as seguintes configurações:
    * **Descrição:** (Opcional) Adicione uma descrição para esta versão.
    * **Executar como:** `Eu` (a sua conta Google).
    * **Quem tem acesso:** `Qualquer pessoa` (se quiser que seja público) ou `Qualquer pessoa na [sua organização]` (se for para uso interno).
4.  Clique em **Implementar**.
5.  O Google irá fornecer-lhe uma **URL da aplicação web**. Esta é a URL que os seus utilizadores irão aceder para usar o painel.

A sua aplicação está agora configurada e pronta para ser usada!