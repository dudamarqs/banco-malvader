const pool = require('./database');

async function recordAudit(userId, action, details) {
    try {
        const query = 'INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)';
        // Se userId for nulo (ações de sistema), insere NULL no banco
        await pool.query(query, [userId || null, action, details]);
    } catch (error) {
        // Loga o erro no console, mas não impede a aplicação de continuar
        console.error('Falha ao gravar na auditoria:', error);
    }
}

module.exports = { recordAudit };