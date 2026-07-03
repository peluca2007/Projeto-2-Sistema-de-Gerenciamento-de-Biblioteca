```markdown
# 📚 Sistema de Gerenciamento de Biblioteca

Um sistema web para gerenciar livros, leitores e empréstimos em uma biblioteca, com autenticação segura e controle de acesso por papéis.

---

## ⚙️ Pré-requisitos

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
- **Git**

---

## 🚀 Instalação e Execução

```bash
# 1. Clone o repositório
git clone [https://github.com/peluca2007/Projeto-2-Sistema-de-Gerenciamento-de-Biblioteca.git](https://github.com/peluca2007/Projeto-2-Sistema-de-Gerenciamento-de-Biblioteca.git)
cd "Projeto-2-Sistema-de-Gerenciamento-de-Biblioteca"

# 2. Instale as dependências
npm install

# 3. Configure os arquivos .env automaticamente
npm run setup

# 4. Inicie o projeto
npm run dev

```

Pronto! Acesse:

* **Frontend**: http://localhost:5173
* **Backend/Swagger**: http://localhost:3001/api-docs

---

## 🔐 Logins Padrão

Utilize as credenciais abaixo para acessar o sistema conforme o nível de acesso desejado:

| Usuário | E-mail | Senha |
| --- | --- | --- |
| **Admin** | `admin@biblioteca.com` | `Admin@123` (ou valor de `ADMIN_PASSWORD` no .env) |
| **Bibliotecário** | `biblio@biblioteca.com` | `Biblio@123` |
| **Leitor 1** | `leitor1@biblioteca.com` | `Leitor@123` |
| **Leitor 2** | `leitor2@biblioteca.com` | `Leitor@456` |

---

## ✨ Funcionalidades

### Admin (Gerenciador)

* ✅ Visualizar dashboard com estatísticas
* ✅ Gerenciar livros (criar, editar, deletar)
* ✅ Gerenciar leitores (criar, editar, deletar)
* ✅ Controlar empréstimos e devoluções
* ✅ Gerenciar usuários do sistema
* ✅ Consultar documentação Swagger

### Leitor (Usuário comum)

* ✅ Visualizar livros disponíveis
* ✅ Solicitar empréstimos
* ✅ Visualizar empréstimos ativos
* ✅ Devolver livros

---

## 📂 Estrutura do Projeto

```text
.
├── backend/          → API Node.js + Express
├── frontend/         → Interface React + Vite
├── scripts/          → Scripts de automação
├── .gitignore        → Arquivos ignorados
├── package.json      → Dependências raiz
└── README.md         → Este arquivo

```

---

## 🔌 API - Endpoints Principais

* `POST /api/auth/login` - Autenticação
* `GET|POST|PUT|DELETE /api/books` - Gerenciar livros
* `GET|POST|PUT|DELETE /api/readers` - Gerenciar leitores
* `GET|POST|PUT|DELETE /api/loans` - Gerenciar empréstimos
* `PUT /api/loans/:id/return` - Devolver livro
* `GET|POST|PUT|DELETE /api/users` - Gerenciar usuários (Admin)
* `GET /api-docs` - Documentação completa (Swagger)

---

## ❓ Solução de Problemas

**Erro: "Não consegui conectar ao banco de dados"**

* Verifique se o PostgreSQL está rodando
* Confirme as credenciais no arquivo `.env`

**Erro: "Porta já está em uso"**

* Outro processo está usando a porta 3001 ou 5173
* Feche a aplicação ou mude a porta no `.env`

**"JWT verification failed" ou token expirado**

* Faça login novamente

**Frontend não conecta com Backend**

* Verifique se o backend está rodando (http://localhost:3001)
* Confirme `VITE_API_URL` no `.env` do frontend

**Erro ao rodar `npm run setup**`

* Execute manualmente:
* `cp backend/.env.example backend/.env`
* `cp frontend/.env.example frontend/.env`



---

## 🔒 Segurança em Produção

Antes de publicar em produção:

1. Altere a senha do admin no `.env`
2. Gere uma chave JWT segura no `JWT_SECRET`
3. Altere a senha do PostgreSQL
4. Configure `VITE_API_URL` com a URL real do servidor

---

## 🛑 Importante - GitHub

O arquivo `.gitignore` **protege automaticamente**:

* `.env` (senhas e credenciais)
* `node_modules/` (dependências)
* Logs e arquivos temporários

Não é necessário fazer configuração manual.

---

**Desenvolvido por:** Pedro Lucas (RA: 2767147)

**Disciplina:** Programação Web Back-end

**Ano:** 2026

```

```
