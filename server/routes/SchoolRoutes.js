const express = require('express');
// O 'router' funciona como um roteador de tráfego: ele recebe a URL e decide qual função executar.
const router = express.Router();
// Importamos o 'controller', que é onde está a lógica "pesada" (acessar o banco de dados).
const schoolController = require('../controllers/schoolController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configuração do Multer para armazenar o arquivo na memória temporariamente
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === ENDPOINT (PONTO DE ACESSO) DA API ===
// URL Completa: GET http://localhost:5000/api/schools
// Contexto: No arquivo server.js, definimos que este arquivo responde por '/api/schools'.
// Ação: Quando o frontend faz um GET nesta rota, executamos a função 'getAllSchools' do controller.
// Segurança: Esta rota é PÚBLICA (sem authMiddleware) para permitir que o formulário de cadastro carregue a lista antes do login.
router.get('/', schoolController.getAllSchools);

// Rota para criar nova escola (Apenas Admin)
router.post('/', authMiddleware, adminMiddleware, schoolController.createSchool);

// Rota para importar escolas via arquivo KMZ (Apenas Admin)
// Endpoint: POST /api/schools/import-kmz
router.post('/import-kmz', authMiddleware, adminMiddleware, upload.single('file'), schoolController.importSchoolsFromKmz);

// Rota para obter uma escola por ID (Apenas Admin)
router.get('/:id', authMiddleware, adminMiddleware, schoolController.getSchoolById);

// Rota para atualizar uma escola (Apenas Admin)
router.put('/:id', authMiddleware, adminMiddleware, schoolController.updateSchool);

// Rota para deletar uma escola (Apenas Admin)
router.delete('/:id', authMiddleware, adminMiddleware, schoolController.deleteSchool);

module.exports = router;
