const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Módulo para criptografia

// DAOs - Certifique-se de que a importação do 'pool' dentro deles está correta
// DE: const { pool } = require(...) PARA: const pool = require(...)
const UserDAO = require('./src/dao/UserDAO');
const AccountDAO = require('./src/dao/AccountDAO');
const TransactionDAO = require('./src/dao/TransactionDAO');
const EmployeeDAO = require('./src/dao/EmployeeDAO');
const ReportDAO = require('./src/dao/ReportDAO');
const { logAction } = require('./src/utils/audit');

const app = express();
const PORT = 3001; // Porta padrão para o backend

app.use(cors());
app.use(express.json());

// --- ROTAS DE AUTENTICAÇÃO ---

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
    const { cpf, password } = req.body;
    if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
    }

    try {
        const user = await UserDAO.findByCpf(cpf);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Criptografa a senha fornecida para comparar com a do banco
        const passwordHash = crypto.createHash('md5').update(password).digest('hex');

        if (user.senha_hash !== passwordHash) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }
        
        // Gera OTP (a procedure no banco foi corrigida)
        await UserDAO.generateOtp(user.id_usuario);
        logAction(user.id_usuario, 'LOGIN_SUCCESS', `Usuário ${user.nome} logado com sucesso.`);

        // Retorna dados essenciais para o frontend
        res.json({ 
            message: 'Login bem-sucedido. Valide o OTP.',
            user: {
                id_usuario: user.id_usuario,
                nome: user.nome,
                tipo_usuario: user.tipo_usuario
            } 
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota de Validação de OTP
app.post('/api/auth/validate-otp', async (req, res) => {
    const { id_usuario, otp } = req.body;
    try {
        const user = await UserDAO.findById(id_usuario);
        // Lógica de validação do OTP
        if (user && user.otp_ativo === otp && new Date(user.otp_expiracao) > new Date()) {
            await UserDAO.clearOtp(id_usuario); // Limpa o OTP após o uso
            res.json({ message: 'OTP validado com sucesso.', user });
        } else {
            res.status(400).json({ message: 'OTP inválido ou expirado.' });
        }
    } catch (error) {
        console.error('Erro na validação do OTP:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// --- ROTAS DE CLIENTE ---

// Rota para buscar contas de um cliente pelo id_usuario
app.get('/api/client/accounts/:id_usuario', async (req, res) => {
    try {
        const accounts = await AccountDAO.findAccountsByUserId(req.params.id_usuario);
        res.json(accounts);
    } catch (error) {
        console.error('Erro ao buscar contas:', error);
        res.status(500).json({ message: 'Erro ao buscar contas.' });
    }
});

// --- ROTAS DE CONTA ---

// Rota para obter saldo
app.get('/api/account/balance/:id_conta', async (req, res) => {
    try {
        const balance = await AccountDAO.getBalance(req.params.id_conta);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter saldo.' });
    }
});

// Rota para obter extrato da conta
app.get('/api/account/statement/:id_conta', async (req, res) => {
    try {
        const statement = await TransactionDAO.getStatement(req.params.id_conta);
        res.json(statement);
    } catch (error) {
        console.error('Erro ao obter extrato:', error);
        res.status(500).json({ message: 'Erro ao obter extrato.' });
    }
});

// Rota para Depósito
app.post('/api/account/deposit', async (req, res) => {
    const { id_conta, valor } = req.body;
    try {
        // CORREÇÃO: Passando um objeto para recordTransaction
        await TransactionDAO.recordTransaction({
            id_conta_origem: id_conta,
            tipo_transacao: 'DEPOSITO',
            valor,
            descricao: 'Depósito em terminal'
        });
        const newBalance = await AccountDAO.getBalance(id_conta);
        res.json({ message: 'Depósito realizado com sucesso!', newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Falha no depósito.' });
    }
});

// Rota para Saque
app.post('/api/account/withdraw', async (req, res) => {
    const { id_conta, valor } = req.body;
    try {
        // CORREÇÃO: Passando um objeto para recordTransaction
        await TransactionDAO.recordTransaction({
            id_conta_origem: id_conta,
            tipo_transacao: 'SAQUE',
            valor,
            descricao: 'Saque em terminal'
        });
        const newBalance = await AccountDAO.getBalance(id_conta);
        res.json({ message: 'Saque realizado com sucesso!', newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Falha no saque.' });
    }
});

// Rota para Transferência
app.post('/api/account/transfer', async (req, res) => {
    const { id_conta_origem, numero_conta_destino, valor } = req.body;
    try {
        const contaDestino = await AccountDAO.findByAccountNumber(numero_conta_destino);
        if (!contaDestino) {
            return res.status(404).json({ message: 'Conta de destino não encontrada.' });
        }
        
        // CORREÇÃO: Passando um objeto para recordTransaction
        await TransactionDAO.recordTransaction({
            id_conta_origem,
            id_conta_destino: contaDestino.id_conta,
            tipo_transacao: 'TRANSFERENCIA',
            valor,
            descricao: `Transferência para ${contaDestino.numero_conta}`
        });

        const newBalance = await AccountDAO.getBalance(id_conta_origem);
        res.json({ message: 'Transferência realizada com sucesso!', newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Falha na transferência.' });
    }
});


// --- ROTAS DE FUNCIONÁRIO ---

// Rota para buscar todos os clientes
app.get('/api/employees/clients', async (req, res) => {
    try {
        const clients = await EmployeeDAO.findAllClients();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar clientes.' });
    }
});

// Rota para criar um novo cliente
app.post('/api/employees/client', async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, password } = req.body;
    
    // CORREÇÃO DE SEGURANÇA: Criptografando a senha antes de salvar
    const senha_hash = crypto.createHash('md5').update(password).digest('hex');

    try {
        // Passa os dados para o DAO, incluindo o hash da senha
        const newClient = await EmployeeDAO.createClient({ nome, cpf, data_nascimento, telefone, senha_hash });
        logAction(null, 'CREATE_CLIENT', `Cliente ${nome} criado.`);
        res.status(201).json({ message: 'Cliente criado com sucesso!', client: newClient });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ message: 'Erro ao criar cliente.' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor do Banco Malvader rodando na porta ${PORT}`);
});
