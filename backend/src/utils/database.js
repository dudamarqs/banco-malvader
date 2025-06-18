// MUDANÇA 1: Importamos 'mysql2/promise' em vez de apenas 'mysql2'
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Coloque sua senha do MySQL aqui, se houver
    port: 3307,
    database: 'banco_malvader',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// MUDANÇA 2: Exportamos o 'pool' diretamente, pois ele já é uma Promise
module.exports = pool;