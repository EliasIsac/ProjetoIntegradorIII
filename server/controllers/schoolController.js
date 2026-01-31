const School = require('../models/School');
const { ForeignKeyConstraintError, Op } = require('sequelize');
const JSZip = require('jszip');
const xml2js = require('xml2js');

// Função para criar uma nova escola (apenas Admin)
exports.createSchool = async (req, res) => {
    try {
        const newSchool = await School.create(req.body);
        res.status(201).json({ 
            message: 'Escola criada com sucesso.', 
            school: newSchool 
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'O nome ou email/cnpj desta escola já está em uso.' });
        }
        console.error('Erro ao criar escola:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função para listar todas as escolas (necessário para os dropdowns de Usuário/Equipamento)
exports.getAllSchools = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where.nome = { [Op.like]: `%${search}%` };
        }

        const schools = await School.findAll({
            where,
            attributes: ['id', 'nome', 'endereco', 'telefone', 'email', 'cnpj'] 
        });
        res.status(200).json(schools);
    } catch (error) {
        console.error('Erro ao buscar escolas:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função para obter uma escola por ID
exports.getSchoolById = async (req, res) => {
    try {
        const school = await School.findByPk(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'Escola não encontrada.' });
        }
        res.status(200).json(school);
    } catch (error) {
        console.error('Erro ao buscar escola por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função para atualizar uma escola (apenas Admin)
exports.updateSchool = async (req, res) => {
    try {
        const school = await School.findByPk(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'Escola não encontrada.' });
        }

        await school.update(req.body);
        res.status(200).json({ message: 'Escola atualizada com sucesso.', school });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'O nome ou email/cnpj desta escola já está em uso.' });
        }
        console.error('Erro ao atualizar escola:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função para deletar uma escola (apenas Admin)
exports.deleteSchool = async (req, res) => {
    try {
        const school = await School.findByPk(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'Escola não encontrada.' });
        }

        await school.destroy();
        res.status(200).json({ message: 'Escola removida com sucesso.' });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
             return res.status(400).json({ message: 'Não é possível remover a escola. Existem usuários, equipamentos ou tickets associados a ela.' });
        }
        console.error('Erro ao deletar escola:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função para importar escolas via arquivo KMZ
exports.importSchoolsFromKmz = async (req, res) => {
    try {
        // Verifica se o arquivo foi recebido pelo Multer
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado. Envie um arquivo .kmz, .geojson ou .csv' });
        }

        let extractedSchools = [];

        // 1. Verifica se é GeoJSON/JSON
        if (req.file.originalname.toLowerCase().endsWith('.json') || req.file.originalname.toLowerCase().endsWith('.geojson')) {
            const jsonContent = JSON.parse(req.file.buffer.toString('utf8'));
            const features = jsonContent.features || [];
            
            extractedSchools = features.map(f => {
                const props = f.properties || {};
                // Tenta pegar o nome de várias propriedades comuns
                let nome = props.name || props.Name || props.NOME || 'Sem Nome';
                let endereco = props.description || props.address || props.ENDERECO || '';
                
                // Remove HTML do endereço se houver (comum em exports de mapas)
                if (endereco && typeof endereco === 'string') {
                    endereco = endereco.replace(/<[^>]*>?/gm, '').trim();
                }
                
                return { nome, endereco };
            });
            console.log(`GeoJSON processado: ${extractedSchools.length} escolas encontradas.`);
        } else if (req.file.originalname.toLowerCase().endsWith('.csv')) {
            // 2. Lógica para CSV
            const csvText = req.file.buffer.toString('utf8');
            // Divide por quebra de linha (suporta Windows \r\n e Unix \n)
            const lines = csvText.split(/\r?\n/);
            
            // Remove linhas vazias
            const validLines = lines.filter(line => line.trim() !== '');
            
            if (validLines.length > 0) {
                // Tenta identificar o separador (vírgula ou ponto e vírgula)
                const firstLine = validLines[0];
                const separator = firstLine.includes(';') ? ';' : ',';
                
                const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ''));
                
                // Mapeia índices das colunas (procura por variações de nome e endereço)
                const idxNome = headers.findIndex(h => h.includes('nome') || h.includes('name') || h.includes('escola'));
                const idxEnd = headers.findIndex(h => h.includes('endereco') || h.includes('endereço') || h.includes('address'));
                
                if (idxNome !== -1) {
                    for (let i = 1; i < validLines.length; i++) {
                        const cols = validLines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, '')); // Remove aspas das pontas
                        if (cols.length > idxNome) {
                            extractedSchools.push({
                                nome: cols[idxNome],
                                endereco: idxEnd !== -1 ? cols[idxEnd] : ''
                            });
                        }
                    }
                    console.log(`CSV processado: ${extractedSchools.length} escolas encontradas.`);
                }
            }
        } else {
            // 3. Lógica para KMZ (Mantida como fallback)
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(req.file.buffer);
            const kmlFileName = Object.keys(zipContent.files).find(f => f.endsWith('.kml'));

            if (kmlFileName) {
                const kmlString = await zipContent.files[kmlFileName].async('string');
                const parser = new xml2js.Parser({ explicitArray: false, stripPrefix: true });
                const result = await parser.parseStringPromise(kmlString);

                const findAllPlacemarks = (obj) => {
                    let found = [];
                    if (Array.isArray(obj)) {
                        obj.forEach(item => found = found.concat(findAllPlacemarks(item)));
                    } else if (typeof obj === 'object' && obj !== null) {
                        if (obj.Placemark) {
                            const pms = Array.isArray(obj.Placemark) ? obj.Placemark : [obj.Placemark];
                            found = found.concat(pms);
                        }
                        Object.keys(obj).forEach(key => {
                            if (key !== 'Placemark') {
                                found = found.concat(findAllPlacemarks(obj[key]));
                            }
                        });
                    }
                    return found;
                };

                const placemarks = findAllPlacemarks(result);
                extractedSchools = placemarks.map(pm => {
                    const nome = pm.name;
                    let endereco = pm.address || (pm.description ? pm.description.replace(/<[^>]*>?/gm, '').trim() : '');
                    if (!endereco && pm.Point && pm.Point.coordinates) {
                        endereco = `Coords: ${pm.Point.coordinates}`;
                    }
                    return { nome, endereco };
                });
            }
        }

        let importedCount = 0;
        // 3. Processamento Unificado no Banco de Dados
        for (const item of extractedSchools) {
            const { nome } = item;
            let { endereco } = item;
            if (!endereco) endereco = 'Endereço importado';

            // Verifica se a escola já existe pelo nome
            const existingSchool = await School.findOne({ where: { nome } });

            if (existingSchool) {
                // Se existir, ATUALIZA o endereço para garantir que esteja atualizado conforme o KMZ
                await existingSchool.update({ endereco });
            } else {
                // Se não existir, CRIA uma nova (usando dados fictícios para campos obrigatórios únicos)
                await School.create({
                    nome,
                    endereco,
                    telefone: 'Não informado',
                    email: `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@sistema.local`,
                    cnpj: `IMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                });
            }
            importedCount++;
        }

        res.status(200).json({ message: 'Importação concluída com sucesso.', total: importedCount });

    } catch (error) {
        console.error('Erro ao importar KMZ:', error);
        res.status(500).json({ message: 'Erro ao processar o arquivo KMZ.' });
    }
};
