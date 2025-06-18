const pool = require('../utils/database');

class EmployeeDAO {
    /**
     * Busca todos os usuários que são do tipo 'cliente'.
     * @returns {Promise<Array>} Uma lista de todos os clientes.
     */
    static async findAllClients() {
        const [rows] = await pool.query(`
            SELECT u.id_usuario, u.nome, u.email, u.cpf, u.data_nascimento, u.telefone 
            FROM usuario u 
            WHERE u.tipo_usuario = 'cliente'
        `);
        return rows;
    }

    /**
     * Cria um novo cliente (usuário) e uma conta corrente para ele.
     * Esta função foi atualizada para incluir o campo 'email'.
     * @param {object} clientData - Dados do cliente.
     * @returns {Promise<object>} O objeto do novo cliente criado.
     */
    static async createClient(clientData) {
        // Adicionado 'email' na desestruturação dos dados
        const { nome, email, cpf, data_nascimento, telefone, senha_hash } = clientData;
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Query de inserção atualizada para incluir o campo 'email'
            const insertUserQuery = 'INSERT INTO usuario (nome, email, cpf, data_nascimento, telefone, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, "cliente")';
            const [userResult] = await connection.query(insertUserQuery, [nome, email, cpf, data_nascimento, telefone, senha_hash]);
            const userId = userResult.insertId;

            // Cria uma conta corrente padrão para o novo cliente
            const numeroConta = Math.floor(10000 + Math.random() * 90000).toString();
            const insertAccountQuery = 'INSERT INTO conta (id_usuario, tipo_conta, numero_conta, saldo) VALUES (?, "corrente", ?, 0.00)';
            await connection.query(insertAccountQuery, [userId, numeroConta]);

            await connection.commit();
            
            return { id_usuario: userId, nome, email, cpf };

        } catch (error) {
            await connection.rollback();
            console.error('Erro ao criar cliente:', error);
            // Lança o erro para ser tratado pela rota no server.js
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = EmployeeDAO;