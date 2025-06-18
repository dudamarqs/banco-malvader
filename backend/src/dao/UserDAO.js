const { pool } = require('../utils/database');

class UserDAO {
    /**
     * Busca um usuário pelo CPF.
     * @param {string} cpf - O CPF do usuário.
     * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
     */
    async findByCpf(cpf) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE cpf = ?',
            [cpf]
        );
        return rows[0];
    }

    /**
     * Busca um usuário pelo ID.
     * @param {number} id - O ID do usuário.
     * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
     */
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE id_usuario = ?',
            [id]
        );
        return rows[0];
    }

    /**
     * CRIAÇÃO: Função para chamar a procedure `gerar_otp` no banco de dados.
     * Esta era a função que estava faltando e causava o erro no login.
     * @param {number} id_usuario - O ID do usuário para o qual o OTP será gerado.
     */
    async generateOtp(id_usuario) {
        // Executa a Stored Procedure que criamos no script SQL.
        await pool.execute('CALL gerar_otp(?)', [id_usuario]);
    }

    /**
     * Limpa o OTP do usuário no banco de dados após uma validação bem-sucedida.
     * @param {number} id_usuario - O ID do usuário a ter o OTP limpo.
     */
    async clearOtp(id_usuario) {
        const query = 'UPDATE usuario SET otp_ativo = NULL, otp_expiracao = NULL WHERE id_usuario = ?';
        await pool.execute(query, [id_usuario]);
    }
}

// Exporta uma instância única da classe (Padrão Singleton)
module.exports = new UserDAO();
