// src/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/LogodaEmpresa.png';
import { Container, Row, Col, Card, Form, Button, Image, ListGroup } from 'react-bootstrap';

function Login() {
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerData, setRegisterData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        schoolId: '',
        schoolName: ''
    });
    const [schoolSuggestions, setSchoolSuggestions] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));

        if (name === 'schoolName') {
            if (value.length > 1) {
                fetchSchools(value);
            } else {
                setSchoolSuggestions([]);
            }
        }
    };

    const fetchSchools = async (query) => {
        try {
            const response = await fetch(`http://localhost:5000/api/schools?search=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Escolas encontradas:", data);
                setSchoolSuggestions(data);
            }
        } catch (err) {
            console.error("Erro ao buscar escolas", err);
        }
    };

    const selectSchool = (school) => {
        setRegisterData(prev => ({
            ...prev,
            schoolId: school.id,
            schoolName: school.nome
        }));
        setSchoolSuggestions([]);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!registerData.schoolId) {
            setError('Por favor, selecione uma escola da lista de sugestões.');
            return;
        }

        try {
            const payload = {
                nome: registerData.nome,
                email: registerData.email,
                senha: registerData.senha,
                telefone: registerData.telefone,
                schoolId: registerData.schoolId,
                role: 'client'
            };

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Cadastro realizado com sucesso! Faça login.');
                setIsRegistering(false);
                setRegisterData({ nome: '', email: '', senha: '', telefone: '', schoolId: '', schoolName: '' });
            } else {
                setError(data.message || 'Erro ao cadastrar.');
            }
        } catch (err) {
            setError('Erro de conexão ao tentar cadastrar.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
   
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) { 
                const data = await response.json();

                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role); 
              
                navigate('/solicitacoes');
                
            } else {
                const data = await response.json();
                setError(data.message || `Falha no login. Código: ${response.status}`);
                console.error('Falha no Login (Dados):', data);
            }
        } catch (err) {
            // Captura falhas de rede ou JSON malformado
            setError('Falha de rede ou erro ao processar a resposta do servidor.');
            console.error('Erro de Rede/Processamento:', err);
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center width:839 height:528 position-relative">
            <Row className="login-box shadow-lg">
                <Col className="bg-white p-4 rounded-start d-flex flex-column justify-content-center align-items-center text-center">
                    {isRegistering ? (
                        <Form onSubmit={handleRegisterSubmit} className="mt-3 w-75">
                            <h3 className="mb-3">Cadastre-se</h3>
                            {error && <p className="text-danger">{error}</p>}
                            
                            <Form.Group className="mb-2 w-100">
                                <Form.Control type="text" name="nome" value={registerData.nome} onChange={handleRegisterChange} placeholder="Nome Completo" required />
                            </Form.Group>

                            <Form.Group className="mb-2 w-100 position-relative">
                                <Form.Control 
                                    type="text" 
                                    name="schoolName" 
                                    value={registerData.schoolName} 
                                    onChange={handleRegisterChange} 
                                    placeholder="Busque sua Escola..." 
                                    autoComplete="off"
                                    required 
                                />
                                {schoolSuggestions.length > 0 && (
                                    <ListGroup className="position-absolute w-100 shadow bg-white" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto', top: '100%' }}>
                                        {schoolSuggestions.map(school => (
                                            <ListGroup.Item action key={school.id} onClick={() => selectSchool(school)}>
                                                {school.nome} - <small className="text-muted">{school.endereco}</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-2 w-100">
                                <Form.Control type="text" name="telefone" value={registerData.telefone} onChange={handleRegisterChange} placeholder="Telefone" required />
                            </Form.Group>

                            <Form.Group className="mb-2 w-100">
                                <Form.Control type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Email" required />
                            </Form.Group>

                            <Form.Group className="mb-3 w-100">
                                <Form.Control type="password" name="senha" value={registerData.senha} onChange={handleRegisterChange} placeholder="Senha" required />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">Confirmar Cadastro</Button>
                            <Button variant="link" onClick={() => setIsRegistering(false)} className="mt-2">Voltar ao Login</Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleSubmit} className="mt-5 w-75">
                            <h3 className="mb-3">Login</h3>
                            {successMessage && <p className="text-success">{successMessage}</p>}
                            {error && <p className="text-danger">{error}</p>}
                            <Form.Group className="mb-3 w-100" controlId="formBasicEmail">
                                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                            </Form.Group>
                            <Form.Group className="mb-3 w-100" controlId="formBasicPassword">
                                <Form.Control type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="Senha" required />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">Entrar</Button>
                        </Form>
                    )}
                </Col>
                <Col className="bg-primary text-white p-4 d-flex flex-column align-items-center justify-content-center text-center login-info-col">
                    <Image src={logo} alt="Logo" style={{ width: '136px', height: '125px' }} />
                    <p className="mt-4">Não possui acesso? Entre em contato com a nossa equipe</p>
                    <div className="d-flex gap-2 w-100">
                        <Button variant="outline-light" className="flex-grow-1">Solicitar</Button>
                        <Button variant="light" className="flex-grow-1" onClick={() => setIsRegistering(true)}>Cadastre-se</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;