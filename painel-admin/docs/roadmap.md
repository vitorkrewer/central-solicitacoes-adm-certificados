# Roadmap e Futuras Melhorias

Este documento descreve possíveis direções e funcionalidades que podem ser adicionadas ao Painel de Administração para o tornar ainda mais poderoso.

## Curto Prazo (Melhorias de Qualidade de Vida)

* **Notificações no Painel:** Criar um pequeno centro de notificações dentro da interface para alertar sobre novas solicitações recebidas desde o último acesso.
* **Modo Escuro:** Implementar um tema escuro para a interface, melhorando a usabilidade em ambientes com pouca luz.
* **Exportação para Excel/CSV:** Adicionar botões na aba "Dados" para exportar a vista filtrada diretamente para um ficheiro `.csv` ou `.xlsx`.

## Médio Prazo (Novas Funcionalidades)

* **Gestão de Utilizadores:** Criar uma nova aba no painel, acessível apenas por administradores, para adicionar ou remover utilizadores e alterar as suas chaves de acesso, eliminando a necessidade de executar o `setupUserKeys.js` manualmente.
* **Níveis de Permissão:** Introduzir diferentes níveis de utilizador (ex: Administrador, Operador). Operadores poderiam visualizar e atualizar status, mas apenas Administradores poderiam aceder a configurações ou exportar dados sensíveis.
* **Dashboard de Indicadores Mais Detalhado:** Expandir o separador "Indicadores" com mais gráficos, como tempo médio para conclusão de uma solicitação e filtros por período (últimos 7 dias, mês, ano).
* **Anexos em Solicitações:** Permitir que, no modal de detalhes, o utilizador possa anexar ficheiros (ex: comprovativo de pagamento) a uma solicitação, guardando o link do ficheiro no Google Drive.

## Longo Prazo (Integrações e Expansão)

* **Integração com Webhooks:** Criar um webhook que possa ser chamado por outras plataformas (ex: sistema de pagamento) para criar uma nova solicitação de certificado automaticamente quando um pagamento for confirmado.
* **Histórico de Alterações (Logs):** Registar todas as alterações de status e observações numa aba de "Logs" dedicada, guardando qual utilizador fez a alteração e quando.
* **Internacionalização (i18n):** Adaptar o código para suportar múltiplos idiomas na interface, preparando o painel para uma possível expansão.
* **Refatoração para um Framework Moderno:** Para projetos futuros com ainda mais complexidade, considerar a utilização de um framework JavaScript como Vue.js, React ou Svelte (compilado para Apps Script com ferramentas como o `esbuild`), para uma gestão de estado mais avançada e uma melhor organização do código front-end.