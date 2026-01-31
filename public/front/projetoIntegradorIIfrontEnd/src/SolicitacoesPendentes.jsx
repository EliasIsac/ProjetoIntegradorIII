import React, { useState, useEffect, useMemo } from 'react';
import { Button, Table, Spinner, Alert, Container, Row, Col, Dropdown } from 'react-bootstrap'; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 💡 IMPORTANTE: Você precisará instalar e importar um conjunto de ícones, como 'react-icons' ou garantir que 'bootstrap-icons' (bi) esteja linkado.
// Exemplo: import { FaSearch, FaCog, FaPlusCircle } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';

// --- FUNÇÕES AUXILIARES AJUSTADAS ---

// Mapeamento de cor e ícone para Prioridade (agora só retorna o nome da classe para ser usada no ID Badge)
const getPriorityColorClass = (priority) => {
    const normalizedPriority = (priority || '').toLowerCase().trim();
    switch (normalizedPriority) {
        case 'alta':
            return 'bg-danger text-light'; // Vermelho
        case 'média':
        case 'media':
            return 'bg-warning text-dark'; // Amarelo
        case 'baixa':
            return 'bg-success text-light'; // Verde
        default:
            return 'bg-secondary text-light';
    }
};

// Mapeamento de cor para Status
const getStatusColor = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    switch (normalizedStatus) {
        case 'aberto':
            return 'bg-warning text-dark'; // Mantenho o estilo original para 'Aberto'
        case 'andamento':
            return 'bg-info text-white';
        case 'encerrado':
            return 'bg-success text-white';
        default:
            return 'bg-secondary text-white';
    }
};

// Componente Tabela (Ajustado)
const SolicitacoesTable = ({ data }) => (
    // Removi 'striped' e ajustei o topo da tabela
    <Table hover responsive className="mt-4">
        {/* Cabeçalho da Tabela - Mais limpo (table-light ou sem cor, como na Imagem 2) */}
        <thead> 
            <tr>
                {/* O Badge de ID na Imagem 2 indica cor, por isso o ID virou uma coluna importante */}
                <th style={{width: '70px'}}>ID</th> 
                <th style={{width: '100px'}}>Prioridade</th> {/* Prioridade em texto simples */}
                <th>Tema</th>
                <th>Solicitante</th>
                <th>Data de Abertura</th>
                <th>Cidade</th>
                <th>Marca</th>
                <th style={{width: '120px'}}>Status</th>
                <th style={{width: '40px'}}></th> {/* Coluna para o ícone de Busca/Detalhes */}
            </tr>
        </thead>
        <tbody>
            {data.map((item, index) => {
                const badgeColor = getPriorityColorClass(item.prioridade);
                
                // Geramos um ID sequencial para simular o ID numérico da Imagem 2 (82, 93)
                const numericId = index + 80; 

                return (
                    <tr key={item.id}> 
                        {/* 💡 ID como um Badge com cor de Prioridade, como na Imagem 2 */}
                        <td>
                             <span className={`badge ${badgeColor} py-1 px-2 fw-bold`}>{numericId}</span>
                        </td>
                        {/* 💡 Prioridade em texto simples, como na Imagem 2 */}
                        <td>{item.prioridade}</td> 
                        <td>{item.tema}</td>
                        <td>{item.solicitante}</td>
                        <td>
                            {/* Data e Hora separados por linha, como na Imagem 2 */}
                            <div>{item.dataAbertura && format(new Date(item.dataAbertura), 'dd/MM/yyyy', { locale: ptBR })}</div>
                            <small className="text-muted">{item.dataAbertura && format(new Date(item.dataAbertura), 'HH:mm', { locale: ptBR })}</small>
                        </td>
                        <td>{item.cidade}</td>
                        <td>{item.marca}</td>
                        <td>
                            {/* Status em texto simples, como na Imagem 2, ou um badge mais discreto */}
                            {item.status}
                        </td>
                        {/* 💡 Ícone de Lupa/Busca na última coluna, como na Imagem 2 */}
                        <td>
                            <Button variant="link" size="sm" title="Ver Detalhes" style={{padding: 0}}>
                                {/* Usando a classe de ícone de busca/lupa do Bootstrap Icons */}
                                <i className="bi bi-search"></i> 
                            </Button>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </Table>
);


const SolicitacoesPendentes = () => {
    const [solicitacoes, setSolicitacoes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const endpoint = 'tickets'; 
    const title = 'Solicitações Pendentes'; 
    // 💡 Estado para simular os filtros (necessário para o layout)
    const [selectedYear, setSelectedYear] = useState('2025'); 
    const [selectedMonth, setSelectedMonth] = useState('Setembro'); 

    // O restante do fetchData e useEffect permanece igual para buscar os dados.
    // ... (Seu código original de fetchData e useEffect aqui) ...

    const fetchData = async () => { /* ... seu código de busca da API ... */
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Acesso negado. Token ausente.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/${endpoint}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (response.status === 403) {
                setError('Acesso Negado.');
                setLoading(false);
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao buscar ${title}`);
            }
            
            const result = await response.json();
            
            let dataArray = [];
            if (Array.isArray(result)) {
                dataArray = result;
            } else if (result && Array.isArray(result.data)) {
                dataArray = result.data; 
            } else if (result && Array.isArray(result.solicitacoes)) {
                 dataArray = result.solicitacoes; 
            } else if (result && Array.isArray(result.tickets)) {
                dataArray = result.tickets; 
            } else {
                console.error("Formato de dados da API inesperado. Recebido:", result);
                dataArray = [];
            }

            setSolicitacoes(dataArray); 

        } catch (err) {
            setError(`Falha na comunicação com o servidor: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    // ... (Fim do seu código original de fetchData e useEffect) ...


    // Calcula a contagem de prioridades (Badges do topo) - Código Original Mantido
    const priorityCounts = useMemo(() => {
        if (!Array.isArray(solicitacoes)) {
            return { total: 0, baixa: 0, media: 0, alta: 0 }; 
        }

        const counts = { total: solicitacoes.length, baixa: 0, media: 0, alta: 0 };
        solicitacoes.forEach(s => {
            const priority = (s.prioridade || '').toLowerCase().trim();
            if (priority === 'baixa') counts.baixa++;
            else if (priority === 'média' || priority === 'media') counts.media++;
            else if (priority === 'alta') counts.alta++;
        });
        return counts;
    }, [solicitacoes]);


    if (loading) return <Spinner animation="border" className="m-5" />;
    if (error) return <Alert variant="danger" className="m-5">Erro: {error}</Alert>;


    return (
        // 💡 Ajuste: Removi o padding, pois o container principal deve ser responsável por isso.
        // O Container deve ter o `className="p-4 shadow-sm bg-white"` se for a área central da Imagem 2
        // Assumindo que este componente é o *conteúdo principal* dentro de um layout maior:
        // O p-4 está definindo o espaçamento do conteúdo em relação à barra lateral
        <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            
            {/* 💡 Linha de Título, Filtros e Ícone de Configurações - JÁ AJUSTADA NA ÚLTIMA VERSÃO */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* ... (Conteúdo de Título e Filtros) ... */}
            </div>
            
            {/* --- Novo Container de Conteúdo Principal (Onde a Tabela Fica) --- */}
            {/* 💡 Adicionado fundo branco e sombra para replicar o design da Imagem 2 */}
            <div className="shadow-sm p-4 bg-white rounded"> 

                {/* 💡 ALTERAÇÃO CHAVE AQUI: Adicionado 'flex-wrap' na div que contém os Badges e o Botão */}
                <div className="d-flex align-items-center mb-4 flex-wrap"> 
                    {/* Badge Total - Azul */}
                    <span className="badge bg-primary text-light me-2 py-2 px-3 fw-bold mb-2">
                        {/* 💡 Aumentei o py-2 e adicionei mb-2 para garantir espaçamento em telas menores */}
                        {priorityCounts.total} Total de Chamados
                    </span>
                    
                    {/* Badge Baixa - Verde */}
                    <span className="badge bg-success text-light me-2 py-2 px-3 fw-bold mb-2">
                        {priorityCounts.baixa} Prioridade Baixa
                    </span>
                    
                    {/* Badge Média - Amarelo/Laranja */}
                    <span className="badge bg-warning text-dark me-2 py-2 px-3 fw-bold mb-2">
                        {priorityCounts.media} Prioridade Média
                    </span>
                    
                    {/* Badge Alta - Vermelho */}
                    <span className="badge bg-danger text-light me-4 py-2 px-3 fw-bold mb-2">
                        {priorityCounts.alta} Prioridade Alta
                    </span>
                    
                    {/* Botão Abrir Chamado - Azul com Ícone */}
                    <Button variant="primary" className="mb-2">
                        <i className="bi bi-plus-circle-fill me-2"></i> Abrir Chamado
                    </Button>
                </div>
            
                {/* Tabela de Solicitações */}
                {solicitacoes.length > 0 ? (
                    <SolicitacoesTable data={solicitacoes} />
                ) : (
                    <Alert variant="info">Nenhuma solicitação pendente encontrada.</Alert>
                )}
            </div> {/* Fim do div de Conteúdo Principal (Sombra Branca) */}
        </div>
    );
};

export default SolicitacoesPendentes;