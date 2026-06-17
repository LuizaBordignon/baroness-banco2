// src/db/connection.js
// Responsável por criar e exportar o pool de conexões com o PostgreSQL.
// Pool = conjunto de conexões reutilizáveis (mais eficiente que abrir/fechar a cada requisição).

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err.message);
    return;
  }
  release();
  console.log('Conectado ao PostgreSQL com sucesso!');
});

module.exports = pool;
