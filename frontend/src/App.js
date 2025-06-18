import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import OtpValidationScreen from './components/OtpValidationScreen'; // Importa a nova tela
import ClienteMenu from './components/ClienteMenu';
import EmployeeMenu from './components/EmployeeMenu';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    // Novos estados para controlar o fluxo de OTP
    const [otpRequired, setOtpRequired] = useState(false);
    const [loginCpf, setLoginCpf] = useState('');

    const handleLoginAttempt = (cpf) => {
        // Etapa 1 do Login: Senha correta, agora precisamos do OTP
        setLoginCpf(cpf);
        setOtpRequired(true);
    };

    const handleOtpSuccess = (loggedInUser) => {
        // Etapa 2 do Login: OTP correto, agora finalizamos o login
        setUser(loggedInUser);
        setOtpRequired(false);
        setLoginCpf('');
    };

    const renderContent = () => {
        if (!user && otpRequired) {
        // Se o OTP é necessário, mostra a tela de validação
        return <OtpValidationScreen cpf={loginCpf} onOtpSuccess={handleOtpSuccess} />;
        }
        
        if (!user) {
        // Se não há usuário e nem OTP pendente, mostra a tela de login
        return <LoginScreen onLogin={handleLoginAttempt} />;
        }

        // Se o usuário está logado, mostra o menu apropriado
        if (user.userType === 'CLIENTE') {
        return <ClienteMenu />;
        }

        if (user.userType === 'FUNCIONARIO') {
        return <EmployeeMenu />;
        }

        return <p>Tipo de usuário desconhecido.</p>;
    };

    return (
        <div className="App">
        <header className="App-header">
            <h1>BANCO MALVADER</h1>
        </header>
        <main>
            {renderContent()}
        </main>
        </div>
    );
}

export default App;