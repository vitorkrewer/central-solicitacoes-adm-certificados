# Painel de Administração de Solicitações - LearningFly

[![Licença: CC BY-NC 4.0](https://img.shields.io/badge/licen%C3%A7a-CC%20BY--NC%204.0-blue?style=flat-square)](https://creativecommons.org/licenses/by-nc/4.0/)
![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-brightgreen.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-ativo-success.svg?style=flat-square)
![Tecnologia](https://img.shields.io/badge/tecnologia-Google%20Apps%20Script-orange.svg?style=flat-square)

Um painel de administração completo, construído como uma aplicação web (WebApp) sobre o ecossistema Google, desenhado para otimizar e centralizar a gestão de solicitações de certificados, históricos acadêmicos e declarações.

## Visão Geral

Este projeto substitui processos manuais e planilhas descentralizadas por uma interface única, reativa e segura. Ele permite que a equipa acadêmica visualize dados em tempo real, atualize status, gere documentos em PDF a partir de modelos e envie comunicações por e-mail, tudo a partir de um único local. A arquitetura modular permite uma fácil expansão para novas instituições e funcionalidades.

## ✨ Principais Funcionalidades

* **Gestão de Solicitações:** Visualize, pesquise e filtre solicitações de certificados de conclusão de curso.
* **Atualização de Status:** Altere o status de cada solicitação (Recebido, Em Análise, Concluído, etc.) diretamente na interface.
* **Visualização de Dados Brutos:** Acessa a uma tabela completa com todos os dados para cópia e exportação.
* **Módulo de Histórico Acadêmico:** Exporte históricos acadêmicos detalhados para alunos específicos, com base em modelos pré-definidos.
* **Módulo de Declarações:**
    * Insira novas solicitações de declaração (matrícula e conclusão) buscando dados de alunos via API.
    * Gere documentos PDF a partir de modelos do Google Docs.
    * Envie as declarações geradas por e-mail, usando um alias configurado.
* **Autenticação Segura:** Acesso ao painel controlado por utilizador e chave, com sessões temporárias.

## 🚀 Começar

Para configurar e implementar o seu próprio painel, siga o **[Guia de Instalação e Configuração](./docs/setup.md)**.

## 📚 Documentação Completa

Para uma visão aprofundada da arquitetura, funcionalidades e API do projeto, consulte a nossa **[documentação completa](./docs/index.md)**.
