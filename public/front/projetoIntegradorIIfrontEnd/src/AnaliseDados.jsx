import React, { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

export default function AnaliseDados({ userRole }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Busca os dados reais do banco de dados
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/tickets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Erro ao buscar dados do banco');
                const result = await response.json();
                // Ajusta conforme a estrutura que sua API retorna
                setTickets(Array.isArray(result) ? result : result.tickets || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Lógica para processar os "Problemas Recorrentes" (agrupando por título)
    const recurringIssues = useMemo(() => {
        const counts = {};
        tickets.forEach(ticket => {
            const titulo = ticket.titulo || 'Sem Título';
            const escola = ticket.School?.nome || 'Não Informada';
            const key = `${titulo}|${escola}`;
            
            if (!counts[key]) {
                counts[key] = { problema: titulo, escola: escola, ocorrencias: 0 };
            }
            counts[key].ocorrencias += 1;
        });

        return Object.values(counts)
            .sort((a, b) => b.ocorrencias - a.ocorrencias)
            .slice(0, 10); // Top 10 conforme solicitado
    }, [tickets]);

    if (loading) return <div className="text-center m-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger" className="m-5">Erro: {error}</Alert>;

    // Mapeia userRole para userType para compatibilidade com seu código do Figma
    const userType = userRole?.toLowerCase();

  return (
    <div className="container-fluid p-4 bg-white min-vh-100">
        <h3 className="text-xl font-bold text-[#212529] mb-4">Problemas Recorrentes</h3>
        <p className="text-sm text-[#6c757d] mb-4">
            {userType === 'admin' 
            ? 'Top 10 combinações Escola + Categoria com mais ocorrências'
            : `Problemas mais frequentes identificados`
            }
        </p>
        
        <div className="overflow-x-auto">
            <table className="table w-full">
            <thead className="bg-[#f8f9fa] border-b-2 border-[#dee2e6]">
                <tr>
                <th className="px-4 py-3 text-left font-bold text-[14px] text-[#212529]">#</th>
                <th className="px-4 py-3 text-left font-bold text-[14px] text-[#212529]">Problema</th>
                <th className="px-4 py-3 text-left font-bold text-[14px] text-[#212529]">Escola</th>
                <th className="px-4 py-3 text-left font-bold text-[14px] text-[#212529]">Ocorrências</th>
                <th className="px-4 py-3 text-left font-bold text-[14px] text-[#212529]">Ação Recomendada</th>
                </tr>
            </thead>
            <tbody>
                {recurringIssues.map((issue, index) => (
                <tr key={index} className="border-b border-[#dee2e6]">
                    <td className="px-4 py-3 text-[14px] text-[#212529]">
                    {index + 1}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#212529]">
                    {issue.problema}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#212529]">
                    {issue.escola}
                    </td>
                    <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[12px] font-semibold ${
                        issue.ocorrencias > 30 ? 'bg-danger text-white' :
                        issue.ocorrencias > 20 ? 'bg-warning text-dark' :
                        'bg-success text-white'
                    }`}>
                        {issue.ocorrencias} vezes
                    </span>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#6c757d]">
                    {issue.ocorrencias > 30 ? 'Treinamento urgente necessário' :
                        issue.ocorrencias > 20 ? 'Revisar equipamentos/processos' :
                        'Monitorar'}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        <div className="mt-6 p-4 bg-[#d1ecf1] border border-[#bee5eb] rounded">
            <h4 className="font-bold text-[#0c5460] mb-2">💡 Recomendações Estratégicas:</h4>
            <ul className="text-sm text-[#0c5460] space-y-1">
            {userType === 'admin' ? (
                <>
                    <li>Considere treinamento preventivo nas unidades com maior volume de chamados.</li>
                    <li>Verifique o ciclo de vida dos equipamentos relacionados aos problemas do Top 3.</li>
                    <li>Avalie a padronização de softwares para reduzir erros de compatibilidade.</li>
                </>
            ) : (
                <li>Monitore a frequência destes eventos para reportar ao suporte central.</li>
            )}
            </ul>
        </div>
    </div>
  );
}