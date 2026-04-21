import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css'; 
import Login from './Login.jsx'; 
import PainelSolicitacoes from './PainelSolicitacoes.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/solicitacoes" element={<PainelSolicitacoes />} />
      </Routes>
    </Router>
  );
}

export default App;