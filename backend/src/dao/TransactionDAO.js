// backend/src/dao/TransactionDAO.js
const { pool } = require('../utils/database');

class TransactionDAO {
    // Método para registrar uma nova transação
    async recordTransaction(id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao) {
        const query = `
            INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao]);
        return result.insertId; // Retorna o ID da transação recém-registrada
    }

    // Método para obter transações por conta
    async getTransactionsByAccountId(id_conta, limit = 50) {
        const query = `
            SELECT * FROM transacao
            WHERE id_conta_origem = ? OR id_conta_destino = ?
            ORDER BY data_hora DESC
            LIMIT ?
        `;
        const [rows] = await pool.execute(query, [id_conta, id_conta, limit]);
        return rows;
    }
}

module.exports = new TransactionDAO();