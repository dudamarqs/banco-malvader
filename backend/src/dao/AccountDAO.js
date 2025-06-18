const pool = require('../utils/database');

class AccountDAO {
    static async getAccountByNumber(numeroConta) {
        const [rows] = await pool.query('SELECT * FROM conta WHERE numero_conta = ?', [numeroConta]);
        return rows[0];
    }

    // As funções abaixo foram movidas para a Tarefa 2, mas as deixo aqui corrigidas
    static async getAccountsByClientId(clientId) {
        const [rows] = await pool.query('SELECT * FROM conta WHERE id_cliente = ?', [clientId]);
        return rows;
    }

    static async createAccount(accountData) {
        const { id_cliente, id_agencia = 1, tipo_conta } = accountData; // id_agencia 1 como padrão
        const numero_conta = Math.floor(100000 + Math.random() * 900000).toString();
        
        const query = 'INSERT INTO conta (numero_conta, id_agencia, tipo_conta, id_cliente) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [numero_conta, id_agencia, tipo_conta, id_cliente]);
        return result.insertId;
    }

    static async updateAccountStatus(accountId, status) {
        const [result] = await pool.query('UPDATE conta SET status = ? WHERE id_conta = ?', [status, accountId]);
        return result.affectedRows;
    }
    
    static async deleteAccount(accountId) {
        const [rows] = await pool.query('SELECT saldo FROM conta WHERE id_conta = ?', [accountId]);
        if (rows.length > 0 && parseFloat(rows[0].saldo) !== 0) {
            throw new Error('Não é possível excluir contas com saldo.');
        }
        const [result] = await pool.query('DELETE FROM conta WHERE id_conta = ?', [accountId]);
        return result.affectedRows;
    }
}

module.exports = AccountDAO;