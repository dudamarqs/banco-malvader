CREATE DATABASE BANCO_MALVADER;
USE BANCO_MALVADER;

-- Tarefa 1.2: Tabela de Usuário (usuario)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    tipo_usuario ENUM('FUNCIONARIO', 'CLIENTE') NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- Aumentado para 255 para acomodar hashes mais longos (ex: bcrypt, mas para MD5 32 seria o suficiente)
    otp_ativo VARCHAR(6),
    otp_expiracao DATETIME
);

-- Tarefa 1.3: Tabela de Clientes (cliente)
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    score_credito DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- Tarefa 1.4: Tabela de Contas (conta)
CREATE TABLE conta (
    id_conta INT AUTO_INCREMENT PRIMARY KEY,
    numero_conta VARCHAR(20) UNIQUE NOT NULL,
    id_agencia INT, -- Inicialmente pode ser NULL ou um valor padrão, pois 'agencia' será adicionado posteriormente
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tipo_conta ENUM('POUPANCA', 'CORRENTE', 'INVESTIMENTO') NOT NULL,
    id_cliente INT NOT NULL,
    data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ATIVA', 'ENCERRADA', 'BLOQUEADA') NOT NULL DEFAULT 'ATIVA',
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- Adicionar índice a numero_conta
CREATE INDEX idx_numero_conta ON conta (numero_conta);

-- Tarefa 1.5: Tabela de Transações (transacao)
CREATE TABLE transacao (
    id_transacao INT AUTO_INCREMENT PRIMARY KEY,
    id_conta_origem INT NOT NULL,
    id_conta_destino INT, -- Pode ser NULL para depósitos/saques
    tipo_transacao ENUM('DEPOSITO', 'SAQUE', 'TRANSFERENCIA', 'TAXA', 'RENDIMENTO') NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(100),
    FOREIGN KEY (id_conta_origem) REFERENCES conta(id_conta),
    FOREIGN KEY (id_conta_destino) REFERENCES conta(id_conta)
);

-- Adicionar índice a data_hora
CREATE INDEX idx_data_hora_transacao ON transacao (data_hora);

-- Tarefa 1.6: Tabela de Auditoria (auditoria)
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT, -- Pode ser NULL se a ação não estiver diretamente ligada a um usuário logado
    acao VARCHAR(50) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detalhes TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- Inserir um usuário CLIENTE de exemplo (CPF: 11122233344, Senha: 123)
-- A senha '123' hasheada em MD5 é '202cb962ac59075b964b07152d234b70'
INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash)
VALUES ('Cliente Teste', '11122233344', '1990-01-01', '999999999', 'CLIENTE', '202cb962ac59075b964b07152d234b70');

-- Inserir este cliente na tabela cliente
INSERT INTO cliente (id_usuario, score_credito)
VALUES (LAST_INSERT_ID(), 100.00); 

-- LAST_INSERT_ID() pega o id_usuario do insert anterior

CREATE TABLE funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    codigo_funcionario VARCHAR(20) UNIQUE NOT NULL,
    cargo ENUM('ESTAGIARIO', 'ATENDENTE', 'GERENTE') NOT NULL,
    id_supervisor INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_supervisor) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE endereco (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT, -- Pode ser NULL se for endereço de agência
    cep VARCHAR(10) NOT NULL,
    local VARCHAR(100) NOT NULL,
    numero_casa INT NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    estado CHAR(2) NOT NULL,
    complemento VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE agencia (
    id_agencia INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    codigo_agencia VARCHAR(10) UNIQUE NOT NULL,
    endereco_id INT NOT NULL,
    FOREIGN KEY (endereco_id) REFERENCES endereco(id_endereco)
);



-- Inserir um usuário FUNCIONARIO de exemplo (CPF: 55566677788, Senha: admin)
-- A senha 'admin' hasheada em MD5 é '21232f297a57a5a743894a0e4a801fc3'
INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash)
VALUES ('Funcionario Teste', '55566677788', '1985-05-15', '888888888', 'FUNCIONARIO', '21232f297a57a5a743894a0e4a801fc3');
