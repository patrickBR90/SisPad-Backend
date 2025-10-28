const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no PostgreSQL:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
    return;
  }
  console.log('✅ Conectado ao PostgreSQL com sucesso!');
  release();
});

// Criar tabelas
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        quantidade INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        produto_id INTEGER REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabelas criadas/atualizadas!');
  } catch (err) {
    console.error('Erro ao criar tabelas:', {
      message: err.message,
      stack: err.stack,
    });
  }
};

initDb();

module.exports = pool;

