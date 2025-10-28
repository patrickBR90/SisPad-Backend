const express = require('express');
const router = express.Router();
const pool = require('../database'); // Agora é pool do PostgreSQL

// Adicionar produto
router.post('/produtos', async (req, res) => {
  const { nome, preco, quantidade } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO produtos (nome, preco, quantidade) VALUES ($1, $2, $3) RETURNING id',
      [nome, preco, quantidade]
    );
    res.json({ id: result.rows[0].id, message: 'Produto adicionado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar produto
router.get('/produtos/:nome', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produtos WHERE nome ILIKE $1',
      [`%${req.params.nome}%`]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar venda
router.post('/vendas', async (req, res) => {
  const { produto_id, quantidade } = req.body;
  try {
    const produtoResult = await pool.query(
      'SELECT preco, quantidade FROM produtos WHERE id = $1',
      [produto_id]
    );
    const produto = produtoResult.rows[0];
    
    if (!produto || produto.quantidade < quantidade) {
      return res.status(400).json({ error: 'Produto insuficiente' });
    }
    
    const total = produto.preco * quantidade;
    
    // Inicia transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO vendas (produto_id, quantidade, total) VALUES ($1, $2, $3)',
        [produto_id, quantidade, total]
      );
      
      await client.query(
        'UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2',
        [quantidade, produto_id]
      );
      
      await client.query('COMMIT');
      res.json({ total });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Relatório
router.get('/relatorio', async (req, res) => {
  try {
    // Calcular início e fim da semana atual (segunda a domingo)
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 (domingo) a 6 (sábado)
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)); // Volta para segunda-feira
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Até domingo

    const inicio = inicioSemana.toISOString().split('T')[0];
    const fim = fimSemana.toISOString().split('T')[0];

    // Query para vendas do dia atual
    const vendasHoje = await pool.query(
      `SELECT p.nome, v.quantidade, v.total::float, v.data 
       FROM vendas v 
       JOIN produtos p ON v.produto_id = p.id 
       WHERE DATE(v.data) = $1`,
      [hoje.toISOString().split('T')[0]]
    );

    // Query para faturamento diário da semana
    const faturamentoSemanal = await pool.query(
      `SELECT DATE(v.data) as dia, SUM(v.total::float) as faturamento
       FROM vendas v
       WHERE DATE(v.data) BETWEEN $1 AND $2
       GROUP BY DATE(v.data)
       ORDER BY DATE(v.data)`,
      [inicio, fim]
    );

    const vendas = vendasHoje.rows.map(venda => ({
      ...venda,
      total: Number(venda.total),
    }));
    const faturamento = vendas.reduce((sum, venda) => sum + Number(venda.total), 0);

    // Formatar faturamento semanal para o gráfico
    const diasSemana = Array(7)
      .fill()
      .map((_, i) => {
        const data = new Date(inicioSemana);
        data.setDate(inicioSemana.getDate() + i);
        return data.toISOString().split('T')[0];
      });
    const faturamentoPorDia = diasSemana.map(dia => {
      const registro = faturamentoSemanal.rows.find(row => row.dia === dia);
      return registro ? Number(registro.faturamento) : 0;
    });

    res.json({
      vendas,
      faturamento,
      faturamentoSemanal: {
        dias: diasSemana, // ex.: ["2025-10-27", "2025-10-28", ...]
        valores: faturamentoPorDia, // ex.: [5.50, 0, 10.00, ...]
      },
    });
  } catch (err) {
    console.error('Erro ao gerar relatório:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

