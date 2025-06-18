// frontend/src/components/LoginScreen.js
import React, { useState } from 'react';
import api from '../api';

const LoginScreen = ({ onLoginSuccess }) => {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('CLIENTE'); // Default
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const data = await api.login(cpf, senha, tipoUsuario);
            if (data.message === 'Login bem-sucedido!') {
                setMessage('Login bem-sucedido!');
                onLoginSuccess(data.user); // Passa os dados do usuário logado
            } else {
                setMessage(data.message || 'Erro no login.');
            }
        } catch (error) {
            console.error('Erro ao chamar a API de login:', error);
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Banco Malvader - Login</h2>
            <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>CPF:</label>
                    <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Usuário:</label>
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                        style={styles.select}
                    >
                        <option value="CLIENTE">Cliente</option>
                        <option value="FUNCIONARIO">Funcionário</option>
                    </select>
                </div>
                <button type="submit" style={styles.button}>Entrar</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
    },
    title: {
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formGroup: {
        marginBottom: '15px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#555',
        fontWeight: 'bold',
    },
    input: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    message: {
        marginTop: '20px',
        color: 'red',
        fontWeight: 'bold',
    },
};

export default LoginScreen;