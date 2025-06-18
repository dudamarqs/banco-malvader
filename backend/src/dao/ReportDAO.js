// backend/src/dao/ReportDAO.js
const pool = require('../utils/database');

class ReportDAO {
    async recordReport(id_funcionario, tipo_relatorio, conteudo) {
        const query = `
            INSERT INTO relatorio (id_funcionario, tipo_relatorio, conteudo)
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.execute(query, [id_funcionario, tipo_relatorio, conteudo]);
        return result.insertId;
    }

    async getMovementReport(startDate, endDate, accountType = null) {
        let query = `
            SELECT t.*, u_origem.nome AS nome_origem, c_origem.numero_conta AS numero_conta_origem,
                   u_destino.nome AS nome_destino, c_destino.numero_conta AS numero_conta_destino
            FROM transacao t
            JOIN conta c_origem ON t.id_conta_origem = c_origem.id_conta
            JOIN cliente cl_origem ON c_origem.id_cliente = cl_origem.id_cliente
            JOIN usuario u_origem ON cl_origem.id_usuario = u_origem.id_usuario
            LEFT JOIN conta c_destino ON t.id_conta_destino = c_destino.id_conta
            LEFT JOIN cliente cl_destino ON c_destino.id_cliente = cl_destino.id_cliente
            LEFT JOIN usuario u_destino ON cl_destino.id_usuario = u_destino.id_usuario
            WHERE t.data_hora BETWEEN ? AND ?
        `;
        const params = [startDate, endDate];

        if (accountType) {
            query += ' AND c_origem.tipo_conta = ?';
            params.push(accountType);
        }
        query += ' ORDER BY t.data_hora DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    async getInadimplentClients() {
        const query = `SELECT * FROM vw_clientes_inadimplentes`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    // Implementar outros relatórios conforme vw_movimentacoes_recentes, etc.
}

module.exports = new ReportDAO();