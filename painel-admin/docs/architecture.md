# Arquitetura do Sistema

O Painel de Administração é uma Aplicação de Página Única (SPA - Single-Page Application) construída sobre a plataforma Google Apps Script. A arquitetura foi desenhada para ser modular, segura e escalável, separando claramente as responsabilidades entre o front-end (o que o utilizador vê) e o back-end (a lógica do servidor).

![Arquitetura](https://img.shields.io/badge/arquitetura-SPA%20sobre%20GAS-blue?style=flat-square)
![Comunicação](https://img.shields.io/badge/comunica%C3%A7%C3%A3o-google.script.run-lightgrey?style=flat-square)

## Estrutura de Ficheiros

O projeto está dividido em duas camadas principais:

### 1. Back-end (Google Apps Script - `.js`)

Executado nos servidores do Google, o back-end é responsável por toda a lógica de negócio, acesso a dados e segurança.

* **`code.js`**: O ficheiro principal do back-end. Contém a função de entrada `doGet(e)`, a lógica de autenticação (`authenticate`, `isTokenValid`), e as funções principais para a gestão de solicitações e históricos.
* **`declaracoes.js`**: Um módulo dedicado que contém toda a lógica para o separador "Declarações", incluindo a geração de PDFs e o envio de e-mails. Isto demonstra a modularidade do sistema.
* **`setupUserKeys.js`**: Um script de utilidade para ser executado manualmente pelo administrador para configurar as credenciais de utilizador de forma segura no `PropertiesService`.
* **`config.js`**: Ficheiro de configurações de ambiente. Contém IDs de planilhas e pastas que mudam entre ambientes (desenvolvimento, produção).
* **`constants.js`**: Contém constantes globais da aplicação que não mudam, como nomes de abas, cabeçalhos de colunas e as configurações detalhadas por instituição (`CONFIG_INSTITUICOES`).

### 2. Front-end (HTML Service - `.html`)

Renderizado no browser do cliente, o front-end é responsável pela interface do utilizador e pela interatividade.

* **`admin-ui.html`**: O ficheiro HTML principal. Define toda a estrutura da página, incluindo o ecrã de login, o painel principal, as abas, as tabelas e os modais. Utiliza a sintaxe `<?!= include('...'); ?>` para injetar os outros ficheiros de front-end.
* **`application.js.html`**: Contém o código JavaScript de inicialização, variáveis globais do lado do cliente e a lógica central da interface.
* **`style.css.html`**: Contém todas as regras de CSS personalizadas para estilizar a aplicação.
* **`events.js`**: Este ficheiro é o "cérebro" da interatividade. Contém todos os `addEventListener` que respondem às ações do utilizador (cliques em botões, alterações em seletores, etc.) e disparam as chamadas para o back-end.
* **`services.js`**: Atua como a camada de comunicação. Contém as funções que executam as chamadas `google.script.run` para o back-end, tratam as respostas (sucesso ou erro) e invocam as funções da UI para atualizar a vista.
* **`ui.js`**: Contém funções que manipulam diretamente o DOM (Document Object Model), como renderizar tabelas, mostrar notificações (`toast`), alternar entre as vistas (`toggleViews`) e controlar o `spinner` de carregamento.
* **`modals.js`**: Funções dedicadas a gerir a lógica dos modais do Bootstrap (ex: exibir detalhes de uma solicitação).

## Fluxo de Dados

A comunicação entre o front-end e o back-end é feita exclusivamente através da API assíncrona `google.script.run`.

1.  **Ação do Utilizador:** Um utilizador clica num botão no painel.
2.  **`events.js`:** Um `addEventListener` captura o clique e chama uma função em `services.js`.
3.  **`services.js`:** A função em `services.js` executa a chamada `google.script.run` para uma função específica no back-end (ex: `code.js` ou `declaracoes.js`), passando os parâmetros necessários (como o token de sessão).
4.  **Back-end (`.js`):** A função no servidor é executada. Ela interage com os serviços Google (Planilhas, Drive, Gmail), processa os dados e retorna um resultado.
5.  **Callback no Front-end:** O resultado é recebido pelo `.withSuccessHandler()` (ou `.withFailureHandler()`) em `services.js`.
6.  **`ui.js`:** A função de callback chama uma ou mais funções em `ui.js` para atualizar a interface do utilizador com os novos dados (ex: recarregar uma tabela, mostrar uma notificação).