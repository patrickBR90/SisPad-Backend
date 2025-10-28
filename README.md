# Sistema-SisPad Backend
Projeto Integrador Univesp


# PDV Backend com Node.js, Express e PostgreSQL

API RESTful para um **Sistema de Ponto de Venda (PDV)** com gerenciamento de produtos, vendas e relatórios diários/semanais.


## Funcionalidades

| Rota | Método | Descrição |
|------|--------|-----------|
| `GET /` | - | Página de status do backend |
| `POST /api/produtos` | Adicionar produto |
| `GET /api/produtos/:nome` | Buscar produto por nome |
| `POST /api/vendas` | Registrar venda |
| `GET /api/relatorio` | Relatório do dia + faturamento semanal |

---

## Tecnologias

- **Node.js** + **Express**
- **PostgreSQL** (via `pg`)
- **Render.com** (deploy gratuito)
- **CORS** habilitado

---

## Estrutura do Projeto
pdv-backend/
├── app.js                  # Servidor principal

├── database.js             # Conexão com PostgreSQL

├── routes/

│      └── vendas.js           # Rotas da API

├── package.json

└── .env                    # Variáveis de ambiente (não versionado)

# Deploy no Render

Crie um Web Service
Conecte ao repositório
Configure:

Build Command: npm install

Start Command: node app.js

Environment: Node

Adicione DATABASE_URL no painel















