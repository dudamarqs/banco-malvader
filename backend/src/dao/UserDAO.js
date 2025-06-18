const pool = require('../utils/database');

class UserDAO {
    /**
     * Busca um usuário pelo CPF.
     * @param {string} cpf - O CPF do usuário.
     * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
     */
    static async findByCpf(cpf) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario WHERE cpf = ?', [cpf]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por CPF:', error);
            throw error;
        }
    }

    /**
     * Busca um usuário pelo ID.
     * @param {number} id - O ID do usuário.
     * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
     */
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    /**
     * Chama a procedure para gerar e armazenar um OTP para o usuário.
     * ESTA FUNÇÃO ESTAVA FALTANDO E CAUSANDO O ERRO.
    * @param {number} id_usuario - O ID do usuário.
    * @returns {Promise<string>} O código OTP gerado.
    */
    static async generateOtp(id_usuario) {
        try {
            // A procedure agora retorna uma linha com o OTP gerado.
            const [result] = await pool.query('CALL gerar_otp(?)', [id_usuario]);
            // Capturamos o OTP da primeira coluna da primeira linha do primeiro resultado.
            const otp = result[0][0].otp;
            return otp;
        } catch (error) {
            console.error('Erro ao gerar OTP:', error);
            throw error;
        }
    }

    /**
     * Limpa o OTP do usuário no banco de dados.
     * @param {number} id_usuario - O ID do usuário.
     */
    static async clearOtp(id_usuario) {
        try {
            const query = 'UPDATE usuario SET otp_ativo = NULL, otp_expiracao = NULL WHERE id_usuario = ?';
            await pool.query(query, [id_usuario]);
        } catch (error) {
            console.error('Erro ao limpar OTP:', error);
            throw error;
        }
    }
}

module.exports = UserDAO;