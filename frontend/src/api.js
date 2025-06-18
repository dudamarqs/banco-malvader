// frontend/src/api.js
const API_BASE_URL = 'http://localhost:3001/api'; // Certifique-se que esta URL corresponde ao seu backend

const api = {
    login: async (cpf, senha, tipo_usuario) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf, senha, tipo_usuario }),
        });
        return response.json();
    },

    openAccount: async (id_cliente, tipo_conta, deposito_inicial, id_funcionario_logado) => {
        const response = await fetch(`${API_BASE_URL}/account/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_cliente, tipo_conta, deposito_inicial, id_funcionario_logado }),
        });
        return response.json();
    },

    deposit: async (numero_conta, valor) => {
        const response = await fetch(`${API_BASE_URL}/account/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numero_conta, valor }),
        });
        return response.json();
    },

    withdraw: async (numero_conta, valor) => {
        const response = await fetch(`${API_BASE_URL}/account/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numero_conta, valor }),
        });
        return response.json();
    },

    getBalance: async (numero_conta) => {
        const response = await fetch(`${API_BASE_URL}/account/balance/${numero_conta}`);
        return response.json();
    },
};

export default api;