// backend/server.js
const express = require('express');
const cors = require('cors'); // Para permitir requisições do frontend
const crypto = require('crypto'); // Para MD5
const { pool, connectToDatabase } = require('./src/utils/database');
const UserDAO = require('./src/dao/UserDAO');
const AccountDAO = require('./src/dao/AccountDAO');
const TransactionDAO = require('./src/dao/TransactionDAO');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear o corpo das requisições como JSON

// Conectar ao banco de dados ao iniciar o servidor
connectToDatabase();

// Função auxiliar para gerar hash MD5 (conforme requisito de senha_hash)
const generateMD5Hash = (text) => {
    return crypto.createHash('md5').update(text).digest('hex');
};

// --- ROTAS DA API ---

// Rota de Teste
app.get('/', (req, res) => {
    res.send('API do Banco Malvader funcionando!');
});

// Tarefa 3.1: Autenticação do Usuário
app.post('/api/auth/login', async (req, res) => {
    const { cpf, senha, tipo_usuario } = req.body;
    const acao = `LOGIN - ${tipo_usuario}`;
    let id_usuario = null;

    try {
        const user = await UserDAO.getUserByCpf(cpf);

        if (!user) {
            // Usuário não encontrado
            await pool.execute(
                'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
                [null, acao, `Falha: Usuário com CPF ${cpf} não encontrado.`]
            );
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        id_usuario = user.id_usuario;
        const hashedPassword = generateMD5Hash(senha);

        // Verificação básica de senha (sem OTP inicialmente, conforme a tarefa)
        if (user.senha_hash !== hashedPassword) {
            // Senha incorreta
            await pool.execute(
                'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
                [id_usuario, acao, 'Falha: Senha incorreta.']
            );
            [cite_start]// No futuro, implementar bloqueio após 3 tentativas [cite: 35]
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        // Tipo de usuário deve corresponder
        if (user.tipo_usuario !== tipo_usuario.toUpperCase()) {
            await pool.execute(
                'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
                [id_usuario, acao, `Falha: Tipo de usuário '${tipo_usuario}' não corresponde ao registrado.`]
            );
            return res.status(401).json({ message: 'Tipo de usuário incorreto para o CPF informado.' });
        }

        // Login bem-sucedido
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario, acao, 'Sucesso: Login realizado.']
        );

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                id_usuario: user.id_usuario,
                nome: user.nome,
                cpf: user.cpf,
                tipo_usuario: user.tipo_usuario
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario, acao, `Erro interno do servidor: ${error.message}`]
        );
        res.status(500).json({ message: 'Erro interno do servidor durante o login.' });
    }
});


// Tarefa 3.2: Abertura de Conta (Menu de Funcionários - Simplificado)
app.post('/api/account/open', async (req, res) => {
    // Para simplificar, assumimos que o funcionário já está autenticado
    // e seu id_usuario é passado na requisição (ou obtido de um token)
    // Para esta fase, vamos simular que um funcionário (id_usuario = 1) está abrindo a conta.
    const { id_cliente, tipo_conta, deposito_inicial } = req.body;
    const id_funcionario_simulado = req.body.id_funcionario_logado || 1; // Usar um ID simulado para o funcionário

    let numero_conta = '';
    let accountId = null;

    try {
        const cliente = await UserDAO.getUserById(id_cliente);
        if (!cliente || cliente.tipo_usuario !== 'CLIENTE') {
            return res.status(400).json({ message: 'Cliente inválido ou ID não corresponde a um cliente.' });
        }

        [cite_start]// Gerar número da conta simplificado (sem dígito verificador complexo inicialmente) [cite: 37, 87]
        // Ex: BANCO-MALVADER-XXXXX
        numero_conta = `BM-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900) + 100}`;

        accountId = await AccountDAO.openAccount(numero_conta, 1, deposito_inicial, tipo_conta.toUpperCase(), cliente.id_usuario); [cite_start]// id_agencia simulado como 1 [cite: 64]

        [cite_start]// Registrar a abertura da conta na tabela de auditoria [cite: 37, 87]
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_funcionario_simulado, 'ABERTURA_CONTA', `Sucesso: Conta ${numero_conta} (${tipo_conta}) aberta para o cliente ID: ${id_cliente}. Saldo inicial: ${deposito_inicial}.`]
        );

        res.status(201).json({ message: 'Conta aberta com sucesso!', id_conta: accountId, numero_conta });

    } catch (error) {
        console.error('Erro ao abrir conta:', error);
        // Registrar falha na auditoria
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_funcionario_simulado, 'ABERTURA_CONTA', `Falha: Erro ao abrir conta para o cliente ID: ${id_cliente}. Detalhes: ${error.message}`]
        );
        res.status(500).json({ message: 'Erro interno do servidor ao abrir conta.' });
    }
});

// Tarefa 3.3: Operação de Depósito (Menu do Cliente)
app.post('/api/account/deposit', async (req, res) => {
    const { numero_conta, valor } = req.body;
    const acao = 'DEPOSITO';
    let id_usuario_cliente = null; // Será preenchido para auditoria

    if (valor <= 0) {
        return res.status(400).json({ message: 'O valor do depósito deve ser positivo.' });
    }

    const connection = await pool.getConnection(); // Obter uma conexão para a transação
    try {
        await connection.beginTransaction(); // Iniciar transação

        const account = await AccountDAO.getAccountByNumber(numero_conta);

        if (!account) {
            throw new Error('Conta não encontrada.');
        }

        id_usuario_cliente = (await UserDAO.getUserById(account.id_cliente)).id_usuario; // Obter id_usuario do cliente

        [cite_start]// Atualizar o saldo da conta [cite: 105, 109]
        const novoSaldo = parseFloat(account.saldo) + parseFloat(valor);
        const updated = await AccountDAO.updateAccountBalance(account.id_conta, novoSaldo);

        if (!updated) {
            throw new Error('Falha ao atualizar o saldo da conta.');
        }

        [cite_start]// Registrar o depósito na tabela de transações [cite: 105, 109]
        await TransactionDAO.recordTransaction(account.id_conta, null, acao, valor, `Depósito na conta ${numero_conta}`);

        // Registrar sucesso na auditoria
        await connection.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Sucesso: Depósito de R$ ${valor} na conta ${numero_conta}. Novo saldo: R$ ${novoSaldo}.`]
        );

        await connection.commit(); // Confirmar transação
        res.status(200).json({ message: 'Depósito realizado com sucesso!', novo_saldo: novoSaldo });

    } catch (error) {
        await connection.rollback(); // Reverter transação em caso de erro
        console.error('Erro ao realizar depósito:', error);
        // Registrar falha na auditoria
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Falha: Erro ao depositar R$ ${valor} na conta ${numero_conta}. Detalhes: ${error.message}`]
        );
        res.status(500).json({ message: 'Erro interno do servidor ao depositar.', error: error.message });
    } finally {
        connection.release(); // Liberar a conexão
    }
});


// Tarefa 3.4: Operação de Retirada (Menu do Cliente)
app.post('/api/account/withdraw', async (req, res) => {
    const { numero_conta, valor } = req.body;
    const acao = 'SAQUE';
    let id_usuario_cliente = null; // Será preenchido para auditoria

    if (valor <= 0) {
        return res.status(400).json({ message: 'O valor do saque deve ser positivo.' });
    }

    const connection = await pool.getConnection(); // Obter uma conexão para a transação
    try {
        await connection.beginTransaction(); // Iniciar transação

        const account = await AccountDAO.getAccountByNumber(numero_conta);

        if (!account) {
            throw new Error('Conta não encontrada.');
        }

        id_usuario_cliente = (await UserDAO.getUserById(account.id_cliente)).id_usuario; // Obter id_usuario do cliente

        [cite_start]// Verificar se é suficiente saldo [cite: 106]
        if (parseFloat(account.saldo) < parseFloat(valor)) {
            throw new Error('Saldo insuficiente para o saque.');
        }

        [cite_start]// Atualizar o saldo da conta [cite: 106, 109]
        const novoSaldo = parseFloat(account.saldo) - parseFloat(valor);
        const updated = await AccountDAO.updateAccountBalance(account.id_conta, novoSaldo);

        if (!updated) {
            throw new Error('Falha ao atualizar o saldo da conta.');
        }

        [cite_start]// Registrar a retirada na tabela de transações [cite: 106, 109]
        await TransactionDAO.recordTransaction(account.id_conta, null, acao, valor, `Saque da conta ${numero_conta}`);

        // Registrar sucesso na auditoria
        await connection.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Sucesso: Saque de R$ ${valor} da conta ${numero_conta}. Novo saldo: R$ ${novoSaldo}.`]
        );

        await connection.commit(); // Confirmar transação
        res.status(200).json({ message: 'Saque realizado com sucesso!', novo_saldo: novoSaldo });

    } catch (error) {
        await connection.rollback(); // Reverter transação em caso de erro
        console.error('Erro ao realizar saque:', error);
        // Registrar falha na auditoria
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Falha: Erro ao sacar R$ ${valor} da conta ${numero_conta}. Detalhes: ${error.message}`]
        );
        res.status(500).json({ message: 'Erro interno do servidor ao sacar.', error: error.message });
    } finally {
        connection.release(); // Liberar a conexão
    }
});

// Tarefa 3.5: Consulta de Saldo (Menu do Cliente)
app.get('/api/account/balance/:numero_conta', async (req, res) => {
    const { numero_conta } = req.params;
    let id_usuario_cliente = null; // Será preenchido para auditoria
    const acao = 'CONSULTA_SALDO';

    try {
        const account = await AccountDAO.getAccountByNumber(numero_conta);

        if (!account) {
            throw new Error('Conta não encontrada.');
        }
        id_usuario_cliente = (await UserDAO.getUserById(account.id_cliente)).id_usuario; // Obter id_usuario do cliente

        // Registrar na auditoria
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Sucesso: Consulta de saldo para a conta ${numero_conta}. Saldo: R$ ${account.saldo}.`]
        );

        res.status(200).json({ numero_conta: account.numero_conta, saldo: account.saldo });

    } catch (error) {
        console.error('Erro ao consultar saldo:', error);
        // Registrar falha na auditoria (se o usuário ou conta for desconhecido, id_usuario_cliente pode ser null)
        await pool.execute(
            'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
            [id_usuario_cliente, acao, `Falha: Erro ao consultar saldo da conta ${numero_conta}. Detalhes: ${error.message}`]
        );
        res.status(500).json({ message: 'Erro interno do servidor ao consultar saldo.', error: error.message });
    }
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});