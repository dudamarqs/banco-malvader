import React, { useState } from 'react';
import * as api from '../api'; // ESTA LINHA FOI CORRIGIDA

function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
        const response = await api.login(username, password);
        if (response.otpRequired) {
            // MUDANÇA: Em vez de fazer o login, passa o CPF (username) para o App.js
            onLogin(username); 
        }
        } catch (err) {
        setError(err.message || 'Falha no login');
        }
    };

    return (
        <div className="login-container">
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
            <label>Usuário:</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            </div>
            <div className="form-group">
            <label>Senha:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>
            <button type="submit">Entrar</button>
        </form>
        </div>
    );
}

export default LoginScreen;