# 🛡️ Plano de Testes e Qualidade (QA) - SupDeskNIT

Este documento registra as atividades de Quality Assurance realizadas para garantir a estabilidade e funcionalidade do sistema de gerenciamento de chamados.

## 1. Escopo de Testes Realizados
* **Autenticação de Usuários:** Validação dos fluxos de login para os perfis Admin, Técnico e Cliente.
* **Integridade do Dashboard:** Verificação da reatividade dos gráficos de chamados e integração com o banco de dados PostgreSQL.
* **Navegação:** Teste de redirecionamento de rotas e persistência de sessão.

## 2. Critérios de Aceite (Login)
* [x] O sistema deve permitir acesso apenas com e-mails institucionais válidos.
* [x] Administradores devem ser redirecionados para a Visão Geral de Chamados imediatamente.
* [x] Mensagens de erro devem ser exibidas em caso de credenciais inválidas.

## 3. Validação de Requisitos
Os requisitos mapeados (Abertura, Acompanhamento e Autenticação) foram confrontados com a interface atual e encontram-se **estáveis**.

## 4. Próximos Passos
* Execução de testes de integração no módulo de Análise Preditiva.
* Correção de bugs identificados nos filtros de busca por escola.

**Responsável QA:** Renan Barcelos
### ✅ Módulos e Fluxos Validados:
* **Autenticação e Roteamento:** Fluxo de login testado. Redirecionamento da opção "Criar novo cadastro" apontando corretamente para o formulário de cadastro de Escolas.
* **Dashboard de Análise de Dados:** Consistência visual aprovada. Gráficos, métricas e *hover effects* responsivos e alinhados aos requisitos do projeto.
* **Controle de Acesso (Perfil):** Validação da visualização exclusiva para o perfil "Admin", com fluxo de *logout* operando corretamente.
* **Navegação Interna:** Abas operacionais (Escolas, Chamados e Histórico) com usabilidade e transição de telas 100% funcionais no protótipo.
