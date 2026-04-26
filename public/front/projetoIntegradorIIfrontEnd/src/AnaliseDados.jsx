import React from 'react';

export default function AnaliseDados({ userRole }) {
  // Dados mockados para Problemas Recorrentes
  const mockRecurringIssues = [
    { problema: 'Lentidão na Rede Wi-Fi', ocorrencias: 45, acao: 'Treinamento urgente necessário' },
    { problema: 'Atualização de SO Windows', ocorrencias: 28, acao: 'Revisar equipamentos/processos' },
    { problema: 'Impressora Offline', ocorrencias: 12, acao: 'Monitorar' },
    { problema: 'Falha no Login de Alunos', ocorrencias: 35, acao: 'Verificar servidor de autenticação' },
    { problema: 'Software Educacional Travando', ocorrencias: 22, acao: 'Atualizar software ou drivers' },
    { problema: 'Projetor Não Liga', ocorrencias: 8, acao: 'Verificar cabos e fonte de energia' },
    { problema: 'Problemas com Áudio em Salas', ocorrencias: 18, acao: 'Checar configurações de som' },
    { problema: 'Teclado/Mouse Não Responde', ocorrencias: 5, acao: 'Substituir periféricos' },
    { problema: 'Backup de Dados Falhando', ocorrencias: 31, acao: 'Revisar rotina de backup e armazenamento' },
    { problema: 'Acesso a Pastas Compartilhadas', ocorrencias: 15, acao: 'Verificar permissões de rede' },
  ];

  // Restrição de Segurança: Apenas Admin acessa esta lógica
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return (
      <div className="alert alert-danger m-5">
        Acesso negado. Esta área é restrita a administradores.
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h1 className="display-5 fw-bold text-dark mb-4">Análise de Dados e Tendências</h1>
      <p className="text-muted mb-5">Visão estratégica e identificação de padrões de chamados</p>

      {/* Problemas Recorrentes */}
      <div className="card shadow-sm border-0 p-4 mb-5">
        <h3 className="h5 fw-bold text-dark mb-4">Problemas Recorrentes</h3>
        <p className="text-muted mb-4">
          {userRole === 'admin'
            ? 'Top 10 combinações Escola + Categoria com mais ocorrências'
            : `Problemas mais frequentes na sua escola` // Adaptei para o contexto do userRole
          }
        </p>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-start text-dark">#</th>
                <th className="px-4 py-3 text-start text-dark">Problema</th>
                <th className="px-4 py-3 text-start text-dark">Ocorrências</th>
                <th className="px-4 py-3 text-start text-dark">Ação Recomendada</th>
              </tr>
            </thead>
            <tbody>
              {mockRecurringIssues.map((issue, index) => (
                <tr key={index} className="border-bottom">
                  <td className="px-4 py-3 text-dark">{index + 1}</td>
                  <td className="px-4 py-3 text-dark">{issue.problema}</td>
                  <td className="px-4 py-3">
                    <span className={`badge rounded-pill px-2 py-1 ${
                      issue.ocorrencias > 30 ? 'bg-danger' :
                      issue.ocorrencias > 20 ? 'bg-warning text-dark' :
                      'bg-success'
                    }`}>
                      {issue.ocorrencias} vezes
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {issue.ocorrencias > 30 ? 'Treinamento urgente necessário' :
                     issue.ocorrencias > 20 ? 'Revisar equipamentos/processos' :
                     'Monitorar'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-info-subtle border border-info-subtle rounded text-info-emphasis">
          <h4 className="h6 fw-bold mb-2">💡 Recomendações Estratégicas:</h4>
          <ul className="small mb-0 list-unstyled"> {/* Usando list-unstyled para remover bullets padrão */}
            <li>Considere treinamento preventivo nas escolas com mais ocorrências</li>
            <li>Avalie a necessidade de upgrade de equipamentos nas categorias críticas</li>
            <li>Implemente documentação de soluções para problemas recorrentes</li>
            <li>Crie FAQ baseado nos problemas mais comuns identificados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}