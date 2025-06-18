const API_URL = 'http://localhost:3000/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro na requisição.');
    }
    return data;
};

// =======================================================
// ==              FUNÇÕES DE AUTENTICAÇÃO              ==
// =======================================================
export const login = async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
};

// Adicione esta função ao seu api.js
export const validateOtp = async (cpf, otp) => {
    const response = await fetch(`${API_URL}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, otp }),
    });
    return handleResponse(response);
};

// =======================================================
// ==              FUNÇÕES DO MENU CLIENTE              ==
// =======================================================
export const deposit = async (numero_conta, valor) => {
    const response = await fetch(`${API_URL}/account/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_conta, valor }),
    });
    return handleResponse(response);
};

export const withdraw = async (numero_conta, valor) => {
    const response = await fetch(`${API_URL}/account/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_conta, valor }),
    });
    return handleResponse(response);
};

export const getBalance = async (numero_conta) => {
    const response = await fetch(`${API_URL}/account/balance/${numero_conta}`);
    return handleResponse(response);
};

export const transfer = async (numero_conta_origem, numero_conta_destino, valor) => {
    const response = await fetch(`${API_URL}/account/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_conta_origem, numero_conta_destino, valor }),
    });
    return handleResponse(response);
};

export const getStatement = async (numero_conta) => {
    const response = await fetch(`${API_URL}/account/statement/${numero_conta}`);
    return handleResponse(response);
};

// =======================================================
// ==      FUNÇÕES DE FUNCIONÁRIO - GESTÃO DE CLIENTES    ==
// =======================================================
export const getClients = async () => {
    const response = await fetch(`${API_URL}/employee/clients`);
    return handleResponse(response);
};

export const createClient = async (clientData) => {
    const response = await fetch(`${API_URL}/employee/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
    });
    return handleResponse(response);
};

export const updateClient = async (clientId, clientData) => {
    const response = await fetch(`${API_URL}/employee/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
    });
    return handleResponse(response);
};

export const deleteClient = async (clientId) => {
    const response = await fetch(`${API_URL}/employee/clients/${clientId}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

// =======================================================
// ==      FUNÇÕES DE FUNCIONÁRIO - GESTÃO DE CONTAS    ==
// =======================================================
export const getClientAccounts = async (clientId) => {
    const response = await fetch(`${API_URL}/employee/clients/${clientId}/accounts`);
    return handleResponse(response);
};

export const createAccount = async (clientId, accountData) => {
    const response = await fetch(`${API_URL}/employee/clients/${clientId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
    });
    return handleResponse(response);
};

export const updateAccountStatus = async (accountId, status) => {
    const response = await fetch(`${API_URL}/employee/accounts/${accountId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

export const deleteAccount = async (accountId) => {
    const response = await fetch(`${API_URL}/employee/accounts/${accountId}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

// =======================================================
// ==        FUNÇÕES DE FUNCIONÁRIO - RELATÓRIOS        ==
// =======================================================
export const getAccountsBalancesReport = async () => {
    const response = await fetch(`${API_URL}/reports/accounts-balances`);
    return handleResponse(response);
};

export const getClientsByAgencyReport = async (agencyId) => {
    const response = await fetch(`${API_URL}/reports/clients-by-agency/${agencyId}`);
    return handleResponse(response);
};

export const getAuditLogReport = async () => {
    const response = await fetch(`${API_URL}/reports/audit`);
    return handleResponse(response);
};