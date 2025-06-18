const pool = require('../utils/database');

class EmployeeDAO {
    // Método para criar um novo cliente
    static async createClient(clientData, connection = pool) {
        const { nome, cpf, endereco, telefone } = clientData;
        const query = 'INSERT INTO cliente (nome, cpf, endereco, telefone) VALUES (?, ?, ?, ?)';
        const [result] = await connection.query(query, [nome, cpf, endereco, telefone]);
        return result.insertId;
    }

    // Método para obter todos os clientes
    static async getAllClients() {
        const [rows] = await pool.query('SELECT * FROM cliente');
        return rows;
    }

    // Método para obter um cliente por ID
    static async getClientById(clientId) {
        const [rows] = await pool.query('SELECT * FROM cliente WHERE id_cliente = ?', [clientId]);
        return rows[0];
    }

    // Método para atualizar os dados de um cliente
    static async updateClient(clientId, clientData) {
        const { nome, endereco, telefone } = clientData; // CPF e email não devem ser alterados aqui
        const query = 'UPDATE cliente SET nome = ?, endereco = ?, telefone = ? WHERE id_cliente = ?';
        const [result] = await pool.query(query, [nome, endereco, telefone, clientId]);
        return result.affectedRows;
    }

    // Método para deletar um cliente
    static async deleteClient(clientId) {
        // Lembre-se que o banco de dados pode impedir a exclusão se houver contas associadas (foreign key constraint)
        const [result] = await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [clientId]);
        return result.affectedRows;
    }
}

module.exports = EmployeeDAO;