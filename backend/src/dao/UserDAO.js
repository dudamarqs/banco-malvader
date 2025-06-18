const pool = require('../utils/database');

class UserDAO {
    // MUDANÇA: A função agora busca pelo CPF, que é o novo 'username'
    static async findByCpf(cpf) {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE cpf = ?', [cpf]);
        return rows[0];
    }

    // Função para criar usuário (usada pelo funcionário ao criar cliente)
    static async createUser(userData, connection = pool) {
        const { nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash } = userData;
        const query = 'INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await connection.query(query, [nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash]);
        return result.insertId;
    }

    // Dentro da classe UserDAO, adicione este método:
    static async validateAndClearOtp(cpf, otp) {
        const connection = await pool.getConnection();
        try {
            // Busca o usuário e verifica se o OTP é válido e não expirou
            const [users] = await connection.query(
                'SELECT * FROM usuario WHERE cpf = ? AND otp_ativo = ? AND otp_expiracao > NOW()',
                [cpf, otp]
            );

            if (users.length > 0) {
                const user = users[0];
                // Limpa o OTP para que não possa ser reutilizado
                await connection.query('UPDATE usuario SET otp_ativo = NULL, otp_expiracao = NULL WHERE id_usuario = ?', [user.id_usuario]);
                return user; // Retorna os dados do usuário em caso de sucesso
            }

            return null; // Retorna nulo se a validação falhar
        } finally {
            connection.release();
        }
    }
}

module.exports = UserDAO;