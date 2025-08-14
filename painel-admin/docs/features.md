# Funcionalidades do Painel

O Painel de Administração foi desenhado para ser uma ferramenta completa para a gestão de processos acadêmicos. Abaixo estão detalhadas as suas principais funcionalidades.

### 1. Autenticação e Segurança

* **Tela de Login:** O acesso ao painel é protegido por um tela de login que requer um **Utilizador** e uma **Chave de Acesso**.
* **Gestão de Sessão:** Após a autenticação bem-sucedida, o sistema gera um token de sessão único que é válido por 6 horas. Todas as comunicações subsequentes com o servidor requerem este token, garantindo que apenas utilizadores autenticados possam realizar ações.

### 2. Módulo de Solicitações

Esta é a vista principal da aplicação, focada na gestão de pedidos de certificados.

* **Visualização Centralizada:** Exibe todas as solicitações numa tabela clara e organizada.
* **Filtro por Status:** Permite filtrar as solicitações por status (Todos, Recebido, Em Análise, Concluído, etc.) através de abas de navegação.
* **Pesquisa Dinâmica:** Um campo de pesquisa permite encontrar rapidamente solicitações por nome, CPF ou protocolo.
* **Atualização de Status:** O status de cada solicitação pode ser alterado diretamente na tabela através de um menu dropdown, e salvo com um clique.
* **Detalhes da Solicitação:** Um botão "Ver" abre um modal com todos os detalhes de uma solicitação específica, incluindo dados pessoais, do curso e de endereço.
* **Observações Internas:** No modal de detalhes, é possível adicionar e salvar observações internas para cada solicitação.

### 3. Módulo de Dados Brutos

* **Tabela Completa:** Apresenta uma tabela com **todos os dados** de todas as solicitações, ideal para análise e exportação.
* **Seleção e Cópia:** Permite selecionar linhas específicas e colunas desejadas para copiar os dados formatados para a área de transferência, prontos para serem colados noutra planilha.

### 4. Módulo de Indicadores

* **Dashboard de Métricas:** Oferece uma visão geral da operação, com cartões que mostram o número de solicitações por status, totais por instituição e médias diárias e mensais.
* **Análise de Tendências:** Inclui uma tabela com o número de solicitações por dia nos últimos 15 dias e gráficos com os "Top 10" cursos e estados com mais solicitações.

### 5. Módulo de Histórico acadêmico

Uma ferramenta poderosa para a geração de documentos acadêmicos.

* **Busca por Curso:** O utilizador seleciona a instituição e depois procura e seleciona o curso desejado.
* **Visualização de Detalhes:** O painel exibe os detalhes do curso e a sua grade curricular completa.
* **Busca de Alunos Concluídos:** Com um clique, o sistema encontra todos os alunos que já concluíram aquele curso específico.
* **Exportação de Histórico:** O utilizador pode selecionar um ou mais alunos da lista e exportar um histórico acadêmico completo para uma nova Planilha Google, preenchida com os dados dos alunos e do curso.
* **Exportação de Template:** É também possível exportar apenas o template do histórico do curso, sem dados de alunos.

### 6. Módulo de Declarações

O módulo mais complexo, automatizando todo o fluxo de criação de declarações.

* **Inserção de Nova Declaração:**
    * Um formulário permite selecionar a instituição e buscar um aluno pelo CPF.
    * O sistema consome uma **API externa** para obter os dados do aluno em tempo real.
    * Em seguida, consome outra API para buscar a lista de cursos em que aquele aluno está matriculado naquela instituição.
    * O utilizador seleciona o curso e o tipo de declaração (Matrícula ou Conclusão) e insere os dados numa planilha de registo.
* **Visualização e Gestão:**
    * Uma tabela exibe todas as declarações inseridas, separadas por tipo (Matrícula/Conclusão).
* **Geração de PDF:**
    * Um botão "Gerar PDF" para cada declaração pendente.
    * O sistema usa um **modelo do Google Docs**, substitui as tags (ex: `{{Nome Completo}}`) pelos dados da planilha, e gera um ficheiro PDF.
    * O link para o PDF gerado é salvo na planilha e fica acessível diretamente na interface.
* **Envio por E-mail:**
    * Após a geração do PDF, um botão "Enviar E-mail" fica disponível.
    * O sistema envia o PDF como anexo para o e-mail do aluno, utilizando um **alias configurado** (ex: `emailparaenvio@suainstituicao.com.br`) para uma comunicação mais profissional.