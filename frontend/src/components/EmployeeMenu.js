import React, { useState, useEffect } from 'react';
import * as api from '../api';

const ClientForm = ({ selectedClient, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nome: '', cpf: '', endereco: '', telefone: '', email: '', senha: ''
    });

    useEffect(() => {
        if (selectedClient) {
            setFormData({ ...selectedClient, senha: '' });
        } else {
            setFormData({ nome: '', cpf: '', endereco: '', telefone: '', email: '', senha: '' });
        }
    }, [selectedClient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{selectedClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <div className="form-group"><input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required /></div>
            <div className="form-group"><input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF (será o usuário)" required /></div>
            <div className="form-group"><input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" required /></div>
            <div className="form-group"><input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" /></div>
            <div className="form-group"><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" /></div>
            <div className="form-group"><input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="Senha para Login" required={!selectedClient} /></div>
            <button type="submit">Salvar</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
        </form>
    );
};

function EmployeeMenu() {
    const [view, setView] = useState('listClients'); // listClients, formClient, listAccounts, reports
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [reportData, setReportData] = useState([]);
    const [activeReport, setActiveReport] = useState('');

    useEffect(() => {
        setReportData([]);
        setActiveReport('');

        if (view === 'listClients') {
            fetchClients();
        }
    }, [view]);

    const fetchClients = async () => { 
        setIsLoading(true);
        try {
            const response = await api.getClients();
            setClients(response.clients);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleSaveClient = async (clientData) => {
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        try {
            if (selectedClient) {
                await api.updateClient(selectedClient.id_cliente, clientData);
                setMessage({ text: 'Cliente atualizado com sucesso!', type: 'success' });
            } else {
                await api.createClient(clientData);
                setMessage({ text: 'Cliente criado com sucesso!', type: 'success' });
            }
            setView('listClients');
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteClient = async (clientId) => { 
        if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
            setIsLoading(true);
            try {
                await api.deleteClient(clientId);
                setMessage({ text: 'Cliente deletado com sucesso!', type: 'success' });
                fetchClients();
            } catch (error) {
                setMessage({ text: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleViewAccounts = async (client) => {
        setSelectedClient(client);
        setIsLoading(true);
        try {
            const response = await api.getClientAccounts(client.id_cliente);
            setAccounts(response.accounts);
            setView('listAccounts');
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleCreateAccount = async () => {
        const tipo_conta = prompt("Digite o tipo da nova conta (ex: CORRENTE, POUPANCA):");
        if (tipo_conta) {
            setIsLoading(true);
            try {
                await api.createAccount(selectedClient.id_cliente, { tipo_conta });
                setMessage({ text: 'Conta criada com sucesso!', type: 'success' });
                handleViewAccounts(selectedClient);
            } catch (error) {
                setMessage({ text: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleToggleAccountStatus = async (account) => {
        const newStatus = account.status === 'ATIVA' ? 'BLOQUEADA' : 'ATIVA';
        if (window.confirm(`Deseja alterar o status da conta para ${newStatus}?`)) {
            setIsLoading(true);
            try {
                await api.updateAccountStatus(account.id_conta, newStatus);
                handleViewAccounts(selectedClient);
            } catch (error) {
                setMessage({ text: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleDeleteAccount = async (accountId) => {
        if (window.confirm('Tem certeza que deseja DELETAR esta conta? Esta ação não pode ser desfeita.')) {
            setIsLoading(true);
            try {
                await api.deleteAccount(accountId);
                handleViewAccounts(selectedClient);
            } catch (error) {
                setMessage({ text: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFetchReport = async (reportType) => {
        setIsLoading(true);
        setActiveReport(reportType);
        setReportData([]);
        setMessage({ text: '', type: '' });
        try {
            let response;
            if (reportType === 'accountsBalances') {
                response = await api.getAccountsBalancesReport();
            } else if (reportType === 'audit') {
                response = await api.getAuditLogReport();
            } else if (reportType === 'clientsByAgency') {
                const agencyId = prompt("Digite o ID da Agência:", "1");
                if (agencyId) {
                    response = await api.getClientsByAgencyReport(agencyId);
                } else {
                    response = { data: [] };
                }
            }
            setReportData(response.data);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderReport = () => {
        if (isLoading) return <p>Gerando relatório...</p>;
        if (!reportData || reportData.length === 0) return <p>Nenhum dado para exibir.</p>;

        if (activeReport === 'accountsBalances') {
            return (
                <table className="statement-table">
                    <thead><tr><th>ID Cliente</th><th>Nome Cliente</th><th>Nº Conta</th><th>Saldo (R$)</th><th>Status</th></tr></thead>
                    <tbody>{reportData.map(row => <tr key={row.id_conta}><td>{row.id_cliente}</td><td>{row.nome_cliente}</td><td>{row.numero_conta}</td><td>{parseFloat(row.saldo).toFixed(2)}</td><td>{row.status}</td></tr>)}</tbody>
                </table>
            );
        }
        if (activeReport === 'clientsByAgency') {
            return (
                <table className="statement-table">
                    <thead><tr><th>ID Cliente</th><th>Nome</th><th>CPF</th><th>Agência</th></tr></thead>
                    <tbody>{reportData.map(row => <tr key={row.id_cliente}><td>{row.id_cliente}</td><td>{row.nome}</td><td>{row.cpf}</td><td>{row.nome_agencia}</td></tr>)}</tbody>
                </table>
            );
        }
        if (activeReport === 'audit') {
            return (
                <table className="statement-table">
                    <thead><tr><th>ID Log</th><th>Usuário</th><th>Ação</th><th>Detalhes</th><th>Data</th></tr></thead>
                    <tbody>{reportData.map(row => <tr key={row.id_auditoria}><td>{row.id_auditoria}</td><td>{row.id_usuario || 'Sistema'}</td><td>{row.acao}</td><td>{row.detalhes}</td><td>{new Date(row.data_hora).toLocaleString('pt-BR')}</td></tr>)}</tbody>
                </table>
            );
        }
        return null;
    };


    return (
        <div className="menu-container">
            <div className="sidebar">
                <h2>Menu Funcionário</h2>
                <button onClick={() => setView('listClients')}>Gerenciar Clientes</button>
                <button onClick={() => setView('reports')}>Relatórios</button>
            </div>
            <div className="content">
                {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                
                {view === 'listClients' && !isLoading && (
                    <div>
                        <h3>Lista de Clientes</h3>
                        <button onClick={() => { setSelectedClient(null); setView('formClient'); }}>Adicionar Novo Cliente</button>
                        <table className="statement-table">
                            <thead><tr><th>ID</th><th>Nome</th><th>CPF</th><th>Ações</th></tr></thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr key={client.id_cliente}>
                                        <td>{client.id_cliente}</td><td>{client.nome}</td><td>{client.cpf}</td>
                                        <td>
                                            <button onClick={() => handleViewAccounts(client)}>Ver Contas</button>
                                            <button onClick={() => { setSelectedClient(client); setView('formClient'); }}>Editar</button>
                                            <button onClick={() => handleDeleteClient(client.id_cliente)}>Deletar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'formClient' && <ClientForm selectedClient={selectedClient} onSave={handleSaveClient} onCancel={() => setView('listClients')} />}

                {view === 'listAccounts' && !isLoading && selectedClient && (
                     <div>
                        <h3>Contas de: {selectedClient.nome}</h3>
                        <button onClick={() => setView('listClients')}>Voltar para Clientes</button>
                        <button onClick={handleCreateAccount}>Abrir Nova Conta</button>
                        <table className="statement-table">
                            <thead><tr><th>Nº Conta</th><th>Tipo</th><th>Saldo (R$)</th><th>Status</th><th>Ações</th></tr></thead>
                            <tbody>
                                {accounts.map(acc => (
                                    <tr key={acc.id_conta}>
                                        <td>{acc.numero_conta}</td><td>{acc.tipo_conta}</td><td>{parseFloat(acc.saldo).toFixed(2)}</td><td>{acc.status}</td>
                                        <td>
                                            <button onClick={() => handleToggleAccountStatus(acc)}>{acc.status === 'ATIVA' ? 'Bloquear' : 'Desbloquear'}</button>
                                            <button onClick={() => handleDeleteAccount(acc.id_conta)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {view === 'reports' && (
                    <div>
                        <h3>Central de Relatórios</h3>
                        <div className="report-buttons">
                            <button onClick={() => handleFetchReport('accountsBalances')}>Contas e Saldos</button>
                            <button onClick={() => handleFetchReport('clientsByAgency')}>Clientes por Agência</button>
                            <button onClick={() => handleFetchReport('audit')}>Log de Auditoria</button>
                        </div>
                        <div className="report-display">
                            {renderReport()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeMenu;