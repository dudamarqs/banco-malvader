// backend/src/dao/UserDAO.js
const { pool } = require('../utils/database');

class UserDAO {
    // Método para criar um novo usuário
    async createUser(nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash) {
        const query = `
            INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash]);
        return result.insertId; // Retorna o ID do usuário recém-criado
    }

    // Método para ler usuário por ID
    async getUserById(id_usuario) {
        const query = 'SELECT * FROM usuario WHERE id_usuario = ?';
        const [rows] = await pool.execute(query, [id_usuario]);
        return rows[0]; // Retorna o primeiro usuário encontrado (ou undefined se não houver)
    }

    // Método para ler usuário por CPF
    async getUserByCpf(cpf) {
        const query = 'SELECT * FROM usuario WHERE cpf = ?';
        const [rows] = await pool.execute(query, [cpf]);
        return rows[0]; // Retorna o primeiro usuário encontrado (ou undefined se não houver)
    }

    // Método para atualizar informações do usuário
    async updateUser(id_usuario, nome, telefone) {
        const query = 'UPDATE usuario SET nome = ?, telefone = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [nome, telefone, id_usuario]);
        return result.affectedRows > 0; // Retorna true se a atualização foi bem-sucedida
    }

    // Método para atualizar OTP
    async updateOtp(id_usuario, otp_ativo, otp_expiracao) {
        const query = 'UPDATE usuario SET otp_ativo = ?, otp_expiracao = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [otp_ativo, otp_expiracao, id_usuario]);
        return result.affectedRows > 0;
    }
}

module.exports = new UserDAO();