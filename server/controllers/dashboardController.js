// dashboardController.js
const Ticket = require('../models/Ticket');


exports.getTicketMetrics = async (req, res) => {
    // 1. Garante que apenas administradores acessem
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem ver este dashboard.' });
    }

    try {
        const total = await Ticket.count();
        const abertas = await Ticket.count({ where: { status: 'aberto' } });
        
        // CORREÇÃO AQUI: Altere para 'em_andamento' ou 'EM_ANDAMENTO'
        const emAndamento = await Ticket.count({ where: { status: 'em_andamento' } }); 
        
        const encerradas = await Ticket.count({ where: { status: 'fechado' } });
        const prioridadeAlta = await Ticket.count({ where: { prioridade: 'alta' } })

        res.status(200).json({
            total,
            abertas,
            emAndamento,
            encerradas,
            prioridadeAlta,
        });

    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        res.status(500).json({ message: 'Erro no servidor ao calcular métricas.' });
    }
};