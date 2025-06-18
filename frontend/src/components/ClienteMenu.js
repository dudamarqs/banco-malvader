import React, { useState } from 'react';
import * as api from '../api';

function ClienteMenu() {
    const [activeSection, setActiveSection] = useState(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    // Novo estado para armazenar o extrato
    const [statement, setStatement] = useState([]);

    const clearState = () => {
        setDestinationAccountNumber('');
        setAmount('');
        setBalance(null);
        setMessage({ text: '', type: '' });
        setStatement([]); // Limpa o extrato também
    };

    const handleMenuClick = (section) => {
        setActiveSection(section);
        clearState();
    };

    // ... (handleOperation, handleGetBalance, handleTransfer) ...
    const handleOperation = async (operationType) => {
        if (!accountNumber || (operationType !== 'balance' && !amount)) {
            setMessage({ text: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            let response;
            if (operationType === 'deposit') {
                response = await api.deposit(accountNumber, parseFloat(amount));
            } else {
                response = await api.withdraw(accountNumber, parseFloat(amount));
            }
            setMessage({ text: response.message, type: 'success' });
            setAmount('');
        } catch (error) {
            setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGetBalance = async () => {
        if (!accountNumber) {
            setMessage({ text: 'Por favor, informe o número da conta.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setBalance(null);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.getBalance(accountNumber);
            setBalance(response.saldo);
            setMessage({ text: 'Saldo consultado com sucesso.', type: 'success' });
        } catch (error) {
            setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!accountNumber || !destinationAccountNumber || !amount) {
            setMessage({ text: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.transfer(accountNumber, destinationAccountNumber, parseFloat(amount));
            setMessage({ text: response.message, type: 'success' });
            setDestinationAccountNumber('');
            setAmount('');
        } catch (error) {
            setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Nova função para buscar o extrato
    const handleGetStatement = async () => {
        if (!accountNumber) {
            setMessage({ text: 'Por favor, informe o número da conta.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        setStatement([]);
        try {
            const response = await api.getStatement(accountNumber);
            setStatement(response.statement);
            setMessage({ text: 'Extrato carregado com sucesso.', type: 'success' });
        } catch (error) {
            setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderSection = () => {
        // ... (lógica de renderização anterior) ...
        if (!activeSection) {
            return <p>Selecione uma operação no menu ao lado.</p>;
        }

        const isTransfer = activeSection === 'Transferir';
        const isStatement = activeSection === 'Extrato';
        let accountLabel = 'Número da Conta:';
        if (isTransfer) accountLabel = 'Conta de Origem:';
        if (isStatement) accountLabel = 'Consultar extrato da Conta:';


        return (
            <div>
                <h3>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
                <div className="form-group">
                    <label>{accountLabel}</label>
                    <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                {isTransfer && (
                     <div className="form-group">
                        <label>Conta de Destino:</label>
                        <input
                            type="text"
                            value={destinationAccountNumber}
                            onChange={(e) => setDestinationAccountNumber(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                )}
                {(activeSection === 'Depositar' || activeSection === 'Sacar' || isTransfer) && (
                    <div className="form-group">
                        <label>Valor (R$):</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                )}
                {activeSection === 'Depositar' && <button onClick={() => handleOperation('deposit')} disabled={isLoading}>{isLoading ? 'Processando...' : 'Confirmar Depósito'}</button>}
                {activeSection === 'Sacar' && <button onClick={() => handleOperation('withdraw')} disabled={isLoading}>{isLoading ? 'Processando...' : 'Confirmar Saque'}</button>}
                {activeSection === 'Consultar Saldo' && <button onClick={handleGetBalance} disabled={isLoading}>{isLoading ? 'Consultando...' : 'Consultar'}</button>}
                {isTransfer && <button onClick={handleTransfer} disabled={isLoading}>{isLoading ? 'Transferindo...' : 'Confirmar Transferência'}</button>}
                {isStatement && <button onClick={handleGetStatement} disabled={isLoading}>{isLoading ? 'Buscando...' : 'Buscar Extrato'}</button>}

                {balance !== null && (
                    <div className="balance-display">
                        <h4>Saldo Atual: R$ {parseFloat(balance).toFixed(2)}</h4>
                    </div>
                )}

                {isStatement && statement.length > 0 && (
                    <div className="statement-container">
                        <h4>Últimas Transações</h4>
                        <table className="statement-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Descrição</th>
                                    <th>Valor (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statement.map(tx => (
                                    <tr key={tx.id_transacao}>
                                        <td>{new Date(tx.data_transacao).toLocaleString('pt-BR')}</td>
                                        <td>{tx.tipo_transacao}</td>
                                        <td>{tx.descricao}</td>
                                        <td>{parseFloat(tx.valor).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="menu-container">
            <div className="sidebar">
                <h2>Menu do Cliente</h2>
                <button onClick={() => handleMenuClick('Depositar')}>Depositar</button>
                <button onClick={() => handleMenuClick('Sacar')}>Sacar</button>
                <button onClick={() => handleMenuClick('Transferir')}>Transferir</button>
                <button onClick={() => handleMenuClick('Extrato')}>Extrato</button>
                <button onClick={() => handleMenuClick('Consultar Saldo')}>Consultar Saldo</button>
            </div>
            <div className="content">
                {renderSection()}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClienteMenu;