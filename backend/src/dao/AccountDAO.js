const { pool } = require('../utils/database');

class AccountDAO {
    async openAccount(numero_conta, id_agencia, saldo, tipo_conta, id_cliente) {
        const query = `
            INSERT INTO conta (numero_conta, id_agencia, saldo, tipo_conta, id_cliente)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [numero_conta, id_agencia, saldo, tipo_conta, id_cliente]);
        return result.insertId;
    }

    // Método para abrir conta específica (CP, CC, CI)
    async openSpecificAccount(id_conta, tipo_conta, details) {
        let query = '';
        let params = [id_conta];
        if (tipo_conta === 'POUPANCA') {
            query = `INSERT INTO conta_poupanca (id_conta, taxa_rendimento) VALUES (?, ?)`; 
            params.push(details.taxa_rendimento);
        } else if (tipo_conta === 'CORRENTE') {
            query = `INSERT INTO conta_corrente (id_conta, limite, data_vencimento, taxa_manutencao) VALUES (?, ?, ?, ?)`;
            params.push(details.limite, details.data_vencimento, details.taxa_manutencao);
        } else if (tipo_conta === 'INVESTIMENTO') {
            query = `INSERT INTO conta_investimento (id_conta, perfil_risco, valor_minimo, taxa_rendimento_base) VALUES (?, ?, ?, ?)`; 
            params.push(details.perfil_risco, details.valor_minimo, details.taxa_rendimento_base);
        } else {
            throw new Error('Tipo de conta específico inválido.');
        }
        const [result] = await pool.execute(query, params);
        return result.insertId;
    }

    async getAccountByNumber(numero_conta) {
        const query = 'SELECT * FROM conta WHERE numero_conta = ?';
        const [rows] = await pool.execute(query, [numero_conta]);
        return rows[0];
    }

    async getAccountsByClientId(id_cliente) {
        const query = 'SELECT * FROM conta WHERE id_cliente = ?';
        const [rows] = await pool.execute(query, [id_cliente]);
        return rows;
    }

    async updateAccountBalance(id_conta, novo_saldo) {
        const query = 'UPDATE conta SET saldo = ? WHERE id_conta = ?';
        const [result] = await pool.execute(query, [novo_saldo, id_conta]);
        return result.affectedRows > 0;
    }

    async updateAccountStatus(id_conta, status) {
        const query = 'UPDATE conta SET status = ? WHERE id_conta = ?';
        const [result] = await pool.execute(query, [status, id_conta]);
        return result.affectedRows > 0;
    }

    async getAccountDetails(id_conta) {
        const query = `
            SELECT
                c.*,
                cp.taxa_rendimento, cp.ultimo_rendimento,
                cc.limite, cc.data_vencimento, cc.taxa_manutencao,
                ci.perfil_risco, ci.valor_minimo, ci.taxa_rendimento_base
            FROM conta c
            LEFT JOIN conta_poupanca cp ON c.id_conta = cp.id_conta
            LEFT JOIN conta_corrente cc ON c.id_conta = cc.id_conta
            LEFT JOIN conta_investimento ci ON c.id_conta = ci.id_conta
            WHERE c.id_conta = ?;
        `;
        const [rows] = await pool.execute(query, [id_conta]);
        return rows[0];
    }
}

module.exports = new AccountDAO();