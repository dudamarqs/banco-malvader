// backend/src/utils/database.js
const mysql = require('mysql2/promise'); // Usar 'promise' para async/await
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banco_malvader',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectToDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release(); // Libera a conexão de volta para o pool
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.message);
        process.exit(1); // Encerra o processo se a conexão falhar
    }
}

module.exports = {
    pool,
    connectToDatabase
};