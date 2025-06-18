// frontend/src/components/EmployeeMenu.js
import React, { useState } from 'react';
import api from '../api';

const EmployeeMenu = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('none'); // 'openAccount'
    const [clientId, setClientId] = useState('');
    const [accountType, setAccountType] = useState('POUPANCA');
    const [initialDeposit, setInitialDeposit] = useState('');
    const [message, setMessage] = useState('');

    const handleOpenAccount = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const data = await api.openAccount(
                clientId,
                accountType,
                parseFloat(initialDeposit),
                user.id_usuario // Passa o ID do funcionário logado
            );
            if (data.id_conta) {
                setMessage(`Conta ${data.numero_conta} aberta com sucesso! ID: ${data.id_conta}`);
                setClientId('');
                setInitialDeposit('');
            } else {
                setMessage(data.message || 'Erro ao abrir conta.');
            }
        } catch (error) {
            console.error('Erro ao abrir conta:', error);
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Menu do Funcionário - Bem-vindo, {user.nome}!</h2>
            <div style={styles.buttonGroup}>
                <button
                    style={styles.menuButton}
                    onClick={() => setActiveSection('openAccount')}
                >
                    Abrir Nova Conta
                </button>
                {/* Outras funcionalidades do funcionário aqui (futuras tarefas) */}
                <button
                    style={{ ...styles.menuButton, backgroundColor: '#dc3545' }}
                    onClick={onLogout}
                >
                    Sair
                </button>
            </div>

            {activeSection === 'openAccount' && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Abrir Nova Conta</h3>
                    <form onSubmit={handleOpenAccount} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>ID do Cliente:</label>
                            <input
                                type="number"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Conta:</label>
                            <select
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                                style={styles.select}
                            >
                                <option value="POUPANCA">Poupança</option>
                                <option value="CORRENTE">Corrente</option>
                                <option value="INVESTIMENTO">Investimento</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Depósito Inicial:</label>
                            <input
                                type="number"
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.button}>Abrir Conta</button>
                    </form>
                    {message && <p style={styles.message}>{message}</p>}
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
        backgroundColor: '#28a745',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
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
        marginTop: '15px',
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
    },
};

export default EmployeeMenu;