# Formulário de Solicitação de Certificados

![Status](https://img.shields.io/badge/status-ativo-success.svg?style=flat-square)
![Plataforma](https://img.shields.io/badge/plataforma-Google%20Apps%20Script-orange.svg?style=flat-square)
![Integração](https://img.shields.io/badge/integra%C3%A7%C3%A3o-Painel%20de%20Admin-blue.svg?style=flat-square)

Este projeto é uma aplicação web (WebApp) que serve como o formulário público para que os alunos solicitem os seus certificados de conclusão de curso. Ele foi desenhado para ser o ponto de entrada de dados para o **Painel de Administração de Solicitações - LearningFly**.

## Visão Geral

O formulário oferece uma interface intuitiva e validada para a recolha de todos os dados necessários para a emissão de um certificado, incluindo dados pessoais, informações do curso e opções de envio físico. Após o envio, os dados são guardados diretamente numa Planilha Google dedicada, que funciona como a base de dados para o Painel de Administração.

## ✨ Principais Funcionalidades

* **Interface Reativa:** O formulário ajusta-se dinamicamente com base nas seleções do utilizador (ex: carregar a lista de cursos após selecionar a instituição).
* **Validação de Dados:** Utiliza validações de front-end (HTML5) e lógica de back-end para garantir a integridade dos dados.
* **Cálculo de Prazo Mínimo:** Alerta o aluno caso ele ainda não tenha atingido o tempo mínimo de curso.
* **Integração de Pagamentos:** Apresenta links de pagamento dinâmicos com base na instituição e na opção de envio selecionada.
* **Geração de Protocolo:** Cria um número de protocolo único para cada solicitação bem-sucedida.

## 📚 Documentação Completa

Para uma visão aprofundada da arquitetura, fluxo de dados e como configurar o formulário, consulte a nossa **[documentação completa](./docs/index.md)**.
