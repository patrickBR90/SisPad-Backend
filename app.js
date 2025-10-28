const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vendasRouter = require('./routes/vendas');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração de CORS
app.use(cors({
  origin: ['https://sispadreact.onrender.com', 'http://localhost:3000'], // Adicione o domínio do frontend e localhost
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use('/api', vendasRouter);

app.get('/', (req, res) => {
  res.send('<h1>PDV Backend com PostgreSQL ✅</h1><p>API em /api</p>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDV rodando em http://localhost:${PORT}`);
});
