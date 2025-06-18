// frontend/src/App.js
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import EmployeeMenu from './components/EmployeeMenu';
import ClientMenu from './components/ClientMenu';
import './App.css'; // Para estilos globais

function App() {
    const [currentUser, setCurrentUser] = useState(null); // Armazena dados do usuário logado

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    return (
        <div className="App">
            {!currentUser ? (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            ) : (
                currentUser.tipo_usuario === 'FUNCIONARIO' ? (
                    <EmployeeMenu user={currentUser} onLogout={handleLogout} />
                ) : (
                    <ClientMenu user={currentUser} onLogout={handleLogout} />
                )
            )}
        </div>
    );
}

export default App;