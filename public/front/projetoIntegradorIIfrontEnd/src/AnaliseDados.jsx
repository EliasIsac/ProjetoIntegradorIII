import React, { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'; //importação graficos

export default function AnaliseDados({ userRole }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const dadosTendencia = useMemo(() => {
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const contagem = {};
        tickets.forEach(ticket => {
            const data = new Date(ticket.createdAt);
            const mes = mesesNomes[data.getMonth()];
            contagem[mes] = (contagem[mes] || 0) + 1;
        });
        return mesesNomes.map(mes => ({
            name: mes,
            chamados: contagem[mes] || 0
        })).filter((_, index) => index <= new Date().getMonth());
    }, [tickets]);

    const dadosPrevisao = useMemo(() => {
        const unidades = {};
        tickets.forEach(ticket => {
            const escola = ticket.School?.nome || 'Outras';
            unidades[escola] = (unidades[escola] || 0) + 1;
        });
        return Object.keys(unidades).map(nome => ({
            name: nome,
            atual: unidades[nome],
            previsto: Math.round(unidades[nome] * 1.15) 
        })).slice(0, 5);
    }, [tickets]); 

    const dadosPorEscola = useMemo(() => {
        const unidades = {};
        tickets.forEach(ticket => {
            const escola = ticket.School?.nome || 'Não Informada';
            unidades[escola] = (unidades[escola] || 0) + 1;
        });
        return Object.keys(unidades).map(nome => ({
            name: nome,
            total: unidades[nome]
        })).sort((a, b) => b.total - a.total);
    }, [tickets]);

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
        return Object.values(counts).sort((a, b) => b.ocorrencias - a.ocorrencias).slice(0, 10);
    }, [tickets]);

    if (loading) return <div className="text-center m-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger" className="m-5">Erro: {error}</Alert>;

    const COLORS = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'];

    const userType = userRole?.toLowerCase();

    return (
        <div className="container-fluid p-4 bg-white min-vh-100">
            
            {/* cabecalho */}
            <div className="bg-[#0d6efd] p-3 rounded-t-lg flex items-center shadow-sm w-full" style={{ backgroundColor: '#0d6efd' }}>
                <div className="d-flex align-items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                        <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
                    </svg>
                    <h4 className="text-white font-bold m-0" style={{ color: 'white' }}>
                        Identificação de Padrões
                    </h4>
                </div>
                <p className="text-white font-bold m-0" style={{ color: 'white' }}>Análises de padrões de tendências e demandas de chamados</p>
            </div>

            {/* tendencias */}
            <div className="border border-t-0 rounded-b-lg p-4 shadow-sm mb-4">
                <div className="row mb-5 mt-2">
                    <div className="col-md-6 mb-4">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h5 className="font-bold text-gray-700 mb-4">Tendências Mensais</h5>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <LineChart data={dadosTendencia}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="chamados" stroke="#fd0d0d" strokeWidth={4} dot={{ r: 6, fill: '#fdc50d' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                     { /*previsoes */}

                    <div className="col-md-6 mb-4">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h5 className="font-bold text-gray-700 mb-4">Previsão de Demanda</h5>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={dadosPrevisao}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="atual" fill="#0dfd49" radius={[4, 4, 0, 0]} name="Volume Atual" />
                                        <Bar dataKey="previsto" fill="#dee2e6" radius={[4, 4, 0, 0]} name="Previsão" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-12">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h5 className="font-bold text-gray-700 mb-4">Volume de Chamados por Unidade Escolar</h5>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={dadosPorEscola} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                                        <XAxis type="number" fontSize={12} axisLine={false} tickLine={false} hide />
                                        <YAxis dataKey="name" type="category" fontSize={11} axisLine={false} tickLine={false} width={150} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Total de Chamados" barSize={25}>
                                            {dadosPorEscola.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-5 border-gray-100" />

                <h3 className="text-xl font-bold text-[#212529] mb-4">Problemas Recorrentes</h3>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-[#f8f9fa] border-b-2 border-[#dee2e6]">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Problema</th>
                                <th className="px-4 py-3 text-left">Escola</th>
                                <th className="px-4 py-3 text-left">Ocorrências</th>
                                <th className="px-4 py-3 text-left">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recurringIssues.map((issue, index) => (
                                <tr key={index} className="border-b border-[#dee2e6]">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{issue.problema}</td>
                                    <td className="px-4 py-3">{issue.escola}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-[12px] font-semibold text-white ${issue.ocorrencias > 30 ? 'bg-danger' : 'bg-success'}`}>
                                            {issue.ocorrencias} vezes
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#6c757d]">
                                        {issue.ocorrencias > 30 ? 'Treinamento urgente' : 'Monitorar'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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