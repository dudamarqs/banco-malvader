// frontend/src/components/ClientMenu.js
import React, { useState } from 'react';
import api from '../api';

const ClientMenu = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('none'); // 'deposit', 'withdraw', 'balance'
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(null);
    const [message, setMessage] = useState('');

    const handleOperation = async (operationType) => {
        setMessage('');
        try {
            let data;
            if (operationType === 'deposit') {
                data = await api.deposit(accountNumber, parseFloat(amount));
            } else if (operationType === 'withdraw') {
                data = await api.withdraw(accountNumber, parseFloat(amount));
            }

            if (data.message) {
                setMessage(data.message);
                if (data.novo_saldo !== undefined) {
                    setBalance(data.novo_saldo); // Atualiza o saldo exibido
                }
                setAmount(''); // Limpa o campo do valor
            } else {
                setMessage('Ocorreu um erro na operação.');
            }
        } catch (error) {
            console.error(`Erro ao realizar ${operationType}:`, error);
            setMessage(`Erro ao conectar com o servidor para ${operationType}. Tente novamente.`);
        }
    };

    const handleGetBalance = async () => {
        setMessage('');
        setBalance(null);
        try {
            const data = await api.getBalance(accountNumber);
            if (data.saldo !== undefined) {
                setBalance(data.saldo);
                setMessage(`Saldo atual para a conta ${data.numero_conta}:`);
            } else {
                setMessage(data.message || 'Conta não encontrada ou erro ao consultar saldo.');
                setBalance(null);
            }
        } catch (error) {
            console.error('Erro ao consultar saldo:', error);
            setMessage('Erro ao conectar com o servidor para consultar saldo. Tente novamente.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Menu do Cliente - Bem-vindo, {user.nome}!</h2>
            <div style={styles.buttonGroup}>
                <button style={styles.menuButton} onClick={() => setActiveSection('deposit')}>Depositar</button>
                <button style={styles.menuButton} onClick={() => setActiveSection('withdraw')}>Sacar</button>
                <button style={styles.menuButton} onClick={() => setActiveSection('balance')}>Consultar Saldo</button>
                {/* Outras funcionalidades do cliente aqui (futuras tarefas) */}
                <button style={{ ...styles.menuButton, backgroundColor: '#dc3545' }} onClick={onLogout}>Sair</button>
            </div>

            {(activeSection === 'deposit' || activeSection === 'withdraw' || activeSection === 'balance') && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        {activeSection === 'deposit' && 'Depositar Dinheiro'}
                        {activeSection === 'withdraw' && 'Sacar Dinheiro'}
                        {activeSection === 'balance' && 'Consultar Saldo'}
                    </h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Número da Conta:</label>
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    {(activeSection === 'deposit' || activeSection === 'withdraw') && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Valor:</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                                style={styles.input}
                            />
                        </div>
                    )}
                    {activeSection === 'deposit' && (
                        <button style={styles.button} onClick={() => handleOperation('deposit')}>Confirmar Depósito</button>
                    )}
                    {activeSection === 'withdraw' && (
                        <button style={styles.button} onClick={() => handleOperation('withdraw')}>Confirmar Saque</button>
                    )}
                    {activeSection === 'balance' && (
                        <button style={styles.button} onClick={handleGetBalance}>Consultar</button>
                    )}

                    {message && <p style={styles.message}>{message}</p>}
                    {balance !== null && activeSection === 'balance' && (
                        <p style={styles.balanceDisplay}>Saldo: R$ {parseFloat(balance).toFixed(2)}</p>
                    )}
                    {balance !== null && (activeSection === 'deposit' || activeSection === 'withdraw') && (
                         <p style={styles.balanceDisplay}>Novo Saldo: R$ {parseFloat(balance).toFixed(2)}</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
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
    buttonGroup: {
        marginBottom: '30px',
    },
    menuButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '0 10px',
    },
    section: {
        marginTop: '20px',
        padding: '20px',
        borderTop: '1px solid #eee',
        textAlign: 'left',
    },
    sectionTitle: {
        color: '#007bff',
        marginBottom: '15px',
    },
    formGroup: {
        marginBottom: '15px',
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
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    message: {
        marginTop: '15px',
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    balanceDisplay: {
        marginTop: '20px',
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center',
    },
};

export default ClientMenu;