const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Módulo nativo do Node.js para criptografia
const pool = require('./src/utils/database'); // Para controle de transações

// DAOs que serão usados (assumindo que foram corrigidos como na resposta anterior)
const UserDAO = require('./src/dao/UserDAO');
const AccountDAO = require('./src/dao/AccountDAO');
const TransactionDAO = require('./src/dao/TransactionDAO');
const EmployeeDAO = require('./src/dao/EmployeeDAO');
const ReportDAO = require('./src/dao/ReportDAO');

const app = express();
// É recomendado usar uma porta diferente da do frontend React (que usa 3000 por padrão)
const port = 3001; 

app.use(cors());
app.use(express.json());

const recordAudit = async (userId, action, details) => { /* ... sua função de auditoria ... */ };

// =======================================================
// ==              ROTAS DE AUTENTICAÇÃO                ==
// =======================================================

// ETAPA 1: Login com Senha
app.post('/api/auth/login', async (req, res) => {
    const { username: cpf, password } = req.body;
    try {
        const user = await UserDAO.findByCpf(cpf);
        if (user) {
            const passwordHash = crypto.createHash('md5').update(password).digest('hex');
            if (user.senha_hash === passwordHash) {
                // Senha correta! Agora, gere e salve o OTP.
                await pool.query('CALL gerar_otp(?, @novo_otp)', [user.id_usuario]);
                const [[otpResult]] = await pool.query('SELECT @novo_otp AS otp');

                console.log(`OTP gerado para ${cpf}: ${otpResult.otp}`); // Log para testes!

                // MUDANÇA: Em vez de dar acesso, sinalize que o OTP é necessário
                res.json({ success: true, otpRequired: true, message: 'Validação de senha bem-sucedida. Por favor, insira o OTP.' });
            } else {
                res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// ETAPA 2: Nova Rota para Validar o OTP
app.post('/api/auth/validate-otp', async (req, res) => {
    const { cpf, otp } = req.body;
    try {
        const user = await UserDAO.validateAndClearOtp(cpf, otp);

        if (user) {
            // OTP Correto! Agora sim, damos acesso ao usuário
            await recordAudit(user.id_usuario, 'login_otp_sucesso', `Login com OTP bem-sucedido para CPF ${cpf}`);
            res.json({
                success: true,
                message: 'OTP validado com sucesso!',
                // Enviamos os dados do usuário para o frontend montar o dashboard
                user: {
                    userType: user.tipo_usuario
                    // você pode adicionar outros dados do usuário aqui se precisar
                }
            });
        } else {
            // OTP incorreto ou expirado
            await recordAudit(null, 'login_otp_falha', `Tentativa de OTP inválido para CPF ${cpf}`);
            res.status(401).json({ success: false, message: 'OTP inválido ou expirado.' });
        }
    } catch (error) {
        console.error('Erro na validação do OTP:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});


// =======================================================
// ==                 ROTAS DE OPERAÇÕES BANCÁRIAS        ==
// =======================================================

// A lógica aqui muda: o backend apenas REGISTRA a transação. O TRIGGER no banco de dados ATUALIZA o saldo.

app.post('/api/account/deposit', async (req, res) => {
    const { numero_conta, valor } = req.body;
    try {
        const account = await AccountDAO.getAccountByNumber(numero_conta);
        if (!account) return res.status(404).json({ success: false, message: 'Conta não encontrada' });
        
        // Apenas registra a transação. O gatilho 'atualizar_saldo' fará a soma no saldo.
        await TransactionDAO.recordTransaction({
            id_conta_origem: account.id_conta,
            tipo_transacao: 'DEPOSITO',
            valor: valor,
            descricao: 'Depósito em conta'
        });
        
        await recordAudit(account.id_cliente, 'deposito', `Depósito de R$${valor} na conta ${numero_conta}`);
        res.json({ success: true, message: 'Depósito recebido com sucesso!' });
    } catch (error) {
        console.error('Erro no depósito:', error);
        res.status(500).json({ success: false, message: error.message || 'Erro ao processar o depósito' });
    }
});

app.post('/api/account/withdraw', async (req, res) => {
    const { numero_conta, valor } = req.body;
    try {
        const account = await AccountDAO.getAccountByNumber(numero_conta);
        if (!account) return res.status(404).json({ success: false, message: 'Conta não encontrada' });
        if (parseFloat(account.saldo) < parseFloat(valor)) {
            return res.status(400).json({ success: false, message: 'Saldo insuficiente.' });
        }

        // Apenas registra a transação. O gatilho 'atualizar_saldo' fará a subtração no saldo.
        await TransactionDAO.recordTransaction({
            id_conta_origem: account.id_conta,
            tipo_transacao: 'SAQUE',
            valor: valor,
            descricao: 'Saque em conta'
        });

        await recordAudit(account.id_cliente, 'saque', `Saque de R$${valor} da conta ${numero_conta}`);
        res.json({ success: true, message: 'Saque realizado com sucesso!' });
    } catch (error) {
        console.error('Erro no saque:', error);
        res.status(500).json({ success: false, message: error.message || 'Erro ao processar o saque' });
    }
});

app.post('/api/account/transfer', async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor } = req.body;
    try {
        const contaOrigem = await AccountDAO.getAccountByNumber(numero_conta_origem);
        const contaDestino = await AccountDAO.getAccountByNumber(numero_conta_destino);
        if (!contaOrigem || !contaDestino) return res.status(404).json({ success: false, message: 'Conta de origem ou destino não encontrada.' });
        if (parseFloat(contaOrigem.saldo) < parseFloat(valor)) return res.status(400).json({ success: false, message: 'Saldo insuficiente' });

        // Apenas registra a transação. O gatilho 'atualizar_saldo' fará a subtração na origem e a soma no destino.
        await TransactionDAO.recordTransaction({
            id_conta_origem: contaOrigem.id_conta,
            id_conta_destino: contaDestino.id_conta,
            tipo_transacao: 'TRANSFERENCIA',
            valor: valor,
            descricao: `Transferência para conta ${numero_conta_destino}`
        });

        res.json({ success: true, message: 'Transferência realizada com sucesso!' });
    } catch (error) {
        console.error('Erro na transferência:', error);
        res.status(500).json({ success: false, message: error.message || 'Erro ao processar a transferência.' });
    }
});

// As rotas de consulta não precisam de grandes alterações
app.get('/api/account/balance/:numero_conta', async (req, res) => {
    try {
        const account = await AccountDAO.getAccountByNumber(req.params.numero_conta);
        if (!account) return res.status(404).json({ success: false, message: 'Conta não encontrada' });
        res.json({ success: true, saldo: account.saldo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao consultar saldo.' });
    }
});

app.get('/api/account/statement/:numero_conta', async (req, res) => {
    try {
        const account = await AccountDAO.getAccountByNumber(req.params.numero_conta);
        if (!account) return res.status(404).json({ success: false, message: 'Conta não encontrada' });
        const statement = await TransactionDAO.getTransactionsByAccountId(account.id_conta);
        res.json({ success: true, statement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao consultar extrato.' });
    }
});

// =======================================================
// ==              ROTAS DE FUNCIONÁRIO                 ==
// =======================================================

// ... (rotas de CRUD de clientes que fizemos na Tarefa 1) ...

// Rota para buscar as contas de um cliente específico
app.get('/api/employee/clients/:clientId/accounts', async (req, res) => {
    const { clientId } = req.params;
    try {
        const accounts = await AccountDAO.getAccountsByClientId(clientId);
        res.json({ success: true, accounts });
    } catch (error) {
        console.error('Erro ao buscar contas do cliente:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar contas.' });
    }
});

// Rota para criar uma nova conta para um cliente
app.post('/api/employee/clients/:clientId/accounts', async (req, res) => {
    const { clientId } = req.params;
    const { tipo_conta, id_agencia = 1 } = req.body; // id_agencia fixo por simplicidade
    try {
        const accountId = await AccountDAO.createAccount({ id_cliente: clientId, id_agencia, tipo_conta });
        await recordAudit(null, 'criacao_conta', `Funcionário abriu a conta ${accountId} para o cliente ${clientId}`);
        res.json({ success: true, message: 'Conta criada com sucesso!', accountId });
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar conta.' });
    }
});

// Rota para atualizar o status de uma conta
app.put('/api/employee/accounts/:accountId/status', async (req, res) => {
    const { accountId } = req.params;
    const { status } = req.body; // Espera 'ATIVA' ou 'BLOQUEADA'
    try {
        const affectedRows = await AccountDAO.updateAccountStatus(accountId, status);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
        }
        await recordAudit(null, 'status_conta', `Funcionário alterou status da conta ${accountId} para ${status}`);
        res.json({ success: true, message: `Status da conta atualizado para ${status}.` });
    } catch (error) {
        console.error('Erro ao atualizar status da conta:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar status.' });
    }
});

// Rota para deletar uma conta
app.delete('/api/employee/accounts/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const affectedRows = await AccountDAO.deleteAccount(accountId);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
        }
        await recordAudit(null, 'delecao_conta', `Funcionário deletou a conta ${accountId}`);
        res.json({ success: true, message: 'Conta deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(400).json({ success: false, message: error.message || 'Erro ao deletar conta.' });
    }
});

// Relatório de todas as contas com saldos e nomes dos clientes
app.get('/api/reports/accounts-balances', async (req, res) => {
    try {
        const data = await ReportDAO.getAccountsWithBalances();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao gerar relatório de contas e saldos:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
    }
});

// Relatório de clientes por agência
app.get('/api/reports/clients-by-agency/:agencyId', async (req, res) => {
    const { agencyId } = req.params;
    try {
        const data = await ReportDAO.getClientsByAgency(agencyId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao gerar relatório de clientes por agência:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
    }
});

// Relatório de logs de auditoria
app.get('/api/reports/audit', async (req, res) => {
    try {
        const data = await ReportDAO.getAuditLogs();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao gerar relatório de auditoria:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
    }
});


app.listen(port, () => {
    console.log(`Servidor do Banco Malvader rodando em http://localhost:${port}`);
});