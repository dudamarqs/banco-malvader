import React, { useState, useEffect, useCallback } from 'react';

// Endereço da sua API backend.
// Certifique-se de que o servidor (server.js) esteja rodando nesta porta.
const API_URL = 'http://localhost:3001/api';

// Funções auxiliares para chamadas de API
const api = {
  login: (cpf, password) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, password }),
  }).then(res => res.ok ? res.json() : Promise.reject(res.json())),

  validateOtp: (id_usuario, otp) => fetch(`${API_URL}/auth/validate-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, otp }),
  }).then(res => res.ok ? res.json() : Promise.reject(res.json())),

  getClientAccounts: (id_usuario) => fetch(`${API_URL}/client/accounts/${id_usuario}`).then(res => res.json()),
  getAccountStatement: (id_conta) => fetch(`${API_URL}/account/statement/${id_conta}`).then(res => res.json()),
  
  deposit: (id_conta, valor) => fetch(`${API_URL}/account/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_conta, valor }),
  }).then(res => res.json()),

  withdraw: (id_conta, valor) => fetch(`${API_URL}/account/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_conta, valor }),
  }).then(res => res.json()),

  transfer: (id_conta_origem, numero_conta_destino, valor) => fetch(`${API_URL}/account/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_conta_origem, numero_conta_destino, valor }),
  }).then(res => res.json()),
  
  // Funções de Funcionário
  getAllClients: () => fetch(`${API_URL}/employees/clients`).then(res => res.json()),
  createClient: (clientData) => fetch(`${API_URL}/employees/client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
  }).then(res => res.ok ? res.json() : Promise.reject(res.json())),
};

// Componente Modal Genérico
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Tela de Login
const LoginScreen = ({ onLoginSuccess }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(cpf, password);
      onLoginSuccess(data.user);
    } catch (errPromise) {
        errPromise.then(err => setError(err.message || 'CPF ou senha incorretos.'));
    }
  };

  return (
    <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Banco Malvader</h1>
        <p className="text-center text-gray-500 mb-6">Acesse sua conta</p>
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">CPF</label>
                <input id="cpf" type="text" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha</label>
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="******************" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                    Entrar
                </button>
            </div>
        </form>
    </div>
  );
};

// Tela de Validação de OTP
const OtpScreen = ({ user, onOtpSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.validateOtp(user.id_usuario, otp);
      onOtpSuccess(data.user);
    } catch (errPromise) {
        errPromise.then(err => setError(err.message || 'OTP inválido ou expirado.'));
    }
  };

  return (
    <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Validação de Segurança</h1>
        <p className="text-center text-gray-500 mb-6">Um código foi enviado para seu dispositivo.</p>
        <form onSubmit={handleValidateOtp} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">Código OTP</label>
                <input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="_ _ _ _ _ _" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center tracking-[0.5em]" maxLength="6" />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                Validar
            </button>
        </form>
    </div>
  );
};

// Menu do Cliente
const ClienteMenu = ({ user, onLogout }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [statement, setStatement] = useState([]);
    const [modal, setModal] = useState({ type: null, show: false });
    const [form, setForm] = useState({ valor: '', numero_conta_destino: '' });
    const [message, setMessage] = useState('');

    const fetchAccounts = useCallback(async () => {
        try {
            const accs = await api.getClientAccounts(user.id_usuario);
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0]);
            }
        } catch (error) {
            setMessage('Erro ao buscar contas.');
        }
    }, [user.id_usuario]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        if (selectedAccount) {
            api.getAccountStatement(selectedAccount.id_conta)
                .then(setStatement)
                .catch(() => setMessage('Erro ao buscar extrato.'));
            
            // O saldo já vem na conta, mas poderia ser buscado separadamente se necessário
            setBalance(selectedAccount.saldo);
        }
    }, [selectedAccount]);

    const handleOperation = async (type) => {
        setMessage('');
        try {
            let response;
            const valor = parseFloat(form.valor);
            if(isNaN(valor) || valor <= 0) {
                setMessage("Valor inválido.");
                return;
            }

            if (type === 'deposit') {
                response = await api.deposit(selectedAccount.id_conta, valor);
            } else if (type === 'withdraw') {
                response = await api.withdraw(selectedAccount.id_conta, valor);
            } else if (type === 'transfer') {
                response = await api.transfer(selectedAccount.id_conta, form.numero_conta_destino, valor);
            }
            
            // Atualiza saldo e contas na tela
            fetchAccounts();
            setMessage(response.message || "Operação realizada com sucesso!");

        } catch (error) {
            setMessage(error.message || 'Falha na operação.');
        } finally {
            setForm({ valor: '', numero_conta_destino: '' });
            setModal({ type: null, show: false });
        }
    };
    
    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Olá, {user.nome}!</h1>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Sair</button>
            </header>

            {message && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Minhas Contas</h2>
                    <select onChange={e => setSelectedAccount(accounts.find(a => a.id_conta == e.target.value))} className="w-full p-2 border rounded mb-4">
                        {accounts.map(acc => <option key={acc.id_conta} value={acc.id_conta}>{acc.tipo_conta} - {acc.numero_conta}</option>)}
                    </select>

                    {selectedAccount && (
                        <div>
                            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                               <p className="text-gray-600">Saldo Atual</p>
                               <p className="text-3xl font-bold text-green-600">R$ {parseFloat(balance).toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => setModal({ type: 'deposit', show: true })} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">Depositar</button>
                                <button onClick={() => setModal({ type: 'withdraw', show: true })} className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600">Sacar</button>
                                <button onClick={() => setModal({ type: 'transfer', show: true })} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Transferir</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Extrato da Conta</h2>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full">
                           <tbody>
                                {statement.map(tx => (
                                    <tr key={tx.id_transacao} className="border-b">
                                        <td className="py-2 px-2">
                                            <p className="font-bold">{tx.tipo_transacao}</p>
                                            <p className="text-sm text-gray-500">{new Date(tx.data_hora).toLocaleString()}</p>
                                        </td>
                                        <td className={`py-2 px-2 text-right font-bold ${tx.tipo_transacao === 'DEPOSITO' ? 'text-green-600' : 'text-red-600'}`}>
                                            R$ {parseFloat(tx.valor).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Modals para Operações */}
            <Modal show={modal.show} onClose={() => setModal({type: null, show: false})} title={modal.type?.charAt(0).toUpperCase() + modal.type?.slice(1)}>
                 <div className="space-y-4">
                    <input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} placeholder="Valor (R$)" className="w-full p-2 border rounded"/>
                    {modal.type === 'transfer' && (
                         <input type="text" value={form.numero_conta_destino} onChange={e => setForm({...form, numero_conta_destino: e.target.value})} placeholder="Número da Conta Destino" className="w-full p-2 border rounded"/>
                    )}
                    <button onClick={() => handleOperation(modal.type)} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Confirmar</button>
                 </div>
            </Modal>
        </div>
    );
};

// Menu do Funcionário
const EmployeeMenu = ({ user, onLogout }) => {
    const [clients, setClients] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ nome: '', cpf: '', data_nascimento: '', telefone: '', password: '' });
    const [message, setMessage] = useState('');

    const fetchClients = useCallback(async () => {
        try {
            const clientList = await api.getAllClients();
            setClients(clientList);
        } catch (error) {
            setMessage("Erro ao carregar lista de clientes.");
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleCreateClient = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const data = await api.createClient(newClientForm);
            setMessage(data.message);
            setShowCreateModal(false);
            fetchClients(); // Refresh list
        } catch (errPromise) {
            errPromise.then(err => setMessage(err.message || "Erro ao criar cliente."));
        }
    };
    
    return (
         <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Painel do Funcionário: {user.nome}</h1>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Sair</button>
            </header>

            {message && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Clientes Cadastrados</h2>
                    <button onClick={() => setShowCreateModal(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Novo Cliente</button>
                </div>
                 <div className="overflow-auto max-h-96">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-2 px-4">Nome</th>
                                <th className="text-left py-2 px-4">CPF</th>
                                <th className="text-left py-2 px-4">Data de Nascimento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id_usuario} className="border-b">
                                    <td className="py-2 px-4">{client.nome}</td>
                                    <td className="py-2 px-4">{client.cpf}</td>
                                    <td className="py-2 px-4">{new Date(client.data_nascimento).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="Criar Novo Cliente">
                <form onSubmit={handleCreateClient} className="space-y-4">
                    <input type="text" placeholder="Nome completo" value={newClientForm.nome} onChange={e => setNewClientForm({...newClientForm, nome: e.target.value})} className="w-full p-2 border rounded" required/>
                    <input type="text" placeholder="CPF (somente números)" value={newClientForm.cpf} onChange={e => setNewClientForm({...newClientForm, cpf: e.target.value})} className="w-full p-2 border rounded" required/>
                    <input type="date" placeholder="Data de Nascimento" value={newClientForm.data_nascimento} onChange={e => setNewClientForm({...newClientForm, data_nascimento: e.target.value})} className="w-full p-2 border rounded" required/>
                    <input type="text" placeholder="Telefone" value={newClientForm.telefone} onChange={e => setNewClientForm({...newClientForm, telefone: e.target.value})} className="w-full p-2 border rounded" required/>
                    <input type="password" placeholder="Senha Provisória" value={newClientForm.password} onChange={e => setNewClientForm({...newClientForm, password: e.target.value})} className="w-full p-2 border rounded" required/>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Criar Cliente</button>
                </form>
            </Modal>
         </div>
    );
};


// Componente Principal
export default function App() {
  const [authState, setAuthState] = useState({
    stage: 'login', // 'login', 'otp', 'authenticated'
    user: null,
  });

  const handleLoginSuccess = (user) => {
    setAuthState({ stage: 'otp', user: user });
  };
  
  const handleOtpSuccess = (fullUser) => {
    setAuthState({ stage: 'authenticated', user: fullUser });
  };

  const handleLogout = () => {
    setAuthState({ stage: 'login', user: null });
  };

  const renderContent = () => {
    switch (authState.stage) {
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      case 'otp':
        return <OtpScreen user={authState.user} onOtpSuccess={handleOtpSuccess} />;
      case 'authenticated':
        if (authState.user.tipo_usuario === 'CLIENTE') {
          return <ClienteMenu user={authState.user} onLogout={handleLogout} />;
        }
        if (authState.user.tipo_usuario === 'FUNCIONARIO') {
          return <EmployeeMenu user={authState.user} onLogout={handleLogout} />;
        }
        return <p>Tipo de usuário desconhecido.</p>;
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center font-sans">
      {renderContent()}
    </main>
  );
}
