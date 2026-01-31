// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

// Importe os controladores e middlewares necessários
const dashboardController = require('../controllers/dashboardController'); 
const verifyToken = require('../middleware/authMiddleware'); // O middleware de autenticação
// O dashboardController já faz a checagem de 'admin' internamente, mas você pode adicionar o adminMiddleware aqui para dupla segurança
const adminMiddleware = require('../middleware/adminMiddleware');


// === Rotas do Dashboard ===
// O prefixo /api/dashboard/ será definido no server.js (próximo passo)
// A rota final será /api/dashboard/metrics

router.get('/metrics', verifyToken, adminMiddleware, dashboardController.getTicketMetrics);

module.exports = router;