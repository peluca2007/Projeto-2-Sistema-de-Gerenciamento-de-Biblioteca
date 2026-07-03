require('dotenv').config();

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerPort = process.env.PORT || 3001;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gerenciamento de Biblioteca',
      version: '1.0.0',
      description: 'API com Node.js, Express, Sequelize, PostgreSQL, JWT e Swagger.',
    },
    servers: [
      {
        url: `http://localhost:${swaggerPort}`,
      },
    ],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Books' },
      { name: 'Readers' },
      { name: 'Loans' },
      { name: 'Admin' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Mensagem de erro.' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@biblioteca.com' },
            password: { type: 'string', example: 'Admin@123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login realizado com sucesso.' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Administrador' },
                email: { type: 'string', example: 'admin@biblioteca.com' },
                role: { type: 'string', enum: ['ADMIN', 'BIBLIOTECARIO', 'LEITOR'] },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'BIBLIOTECARIO', 'LEITOR'] },
            status: { type: 'string', enum: ['ATIVO', 'INATIVO'] },
          },
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', example: 'Maria Oliveira' },
            email: { type: 'string', example: 'maria@biblioteca.com' },
            password: { type: 'string', example: 'Senha@123' },
            role: { type: 'string', enum: ['ADMIN', 'BIBLIOTECARIO', 'LEITOR'] },
            status: { type: 'string', enum: ['ATIVO', 'INATIVO'], example: 'ATIVO' },
          },
        },
        Book: {
          type: 'object',
          required: ['title', 'author', 'publisher', 'publicationYear', 'category', 'isbn'],
          properties: {
            title: { type: 'string', example: 'Introdução a Algoritmos' },
            author: { type: 'string', example: 'Cormen' },
            publisher: { type: 'string', example: 'Editora A' },
            publicationYear: { type: 'integer', example: 2009 },
            category: { type: 'string', example: 'Computação' },
            isbn: { type: 'string', example: '9780262033848' },
            totalQuantity: { type: 'integer', example: 5 },
            availableQuantity: { type: 'integer', example: 5 },
            status: { type: 'string', enum: ['DISPONIVEL', 'INDISPONIVEL'] },
          },
        },
        BookResponse: {
          allOf: [
            { $ref: '#/components/schemas/Book' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        Reader: {
          type: 'object',
          required: ['name', 'cpfOrRa', 'email', 'phone', 'address'],
          properties: {
            name: { type: 'string', example: 'José da Silva' },
            cpfOrRa: { type: 'string', example: 'RA-1001' },
            email: { type: 'string', example: 'jose@exemplo.com' },
            phone: { type: 'string', example: '(11) 99999-0000' },
            address: { type: 'string', example: 'Rua A, 123' },
            status: { type: 'string', enum: ['ATIVO', 'INATIVO'] },
          },
        },
        ReaderResponse: {
          allOf: [
            { $ref: '#/components/schemas/Reader' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        Loan: {
          type: 'object',
          required: ['readerId', 'bookId'],
          properties: {
            readerId: { type: 'integer', example: 1 },
            bookId: { type: 'integer', example: 1 },
            loanDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            returnDate: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['EM_ABERTO', 'DEVOLVIDO', 'ATRASADO'] },
          },
        },
        LoanResponse: {
          allOf: [
            { $ref: '#/components/schemas/Loan' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                reader: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'José da Silva' },
                    email: { type: 'string', example: 'jose@exemplo.com' },
                    status: { type: 'string', example: 'ATIVO' },
                  },
                },
                book: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    title: { type: 'string', example: 'Introdução a Algoritmos' },
                    author: { type: 'string', example: 'Cormen' },
                    isbn: { type: 'string', example: '9780262033848' },
                    status: { type: 'string', example: 'DISPONIVEL' },
                  },
                },
              },
            },
          ],
        },
        DashboardResponse: {
          type: 'object',
          properties: {
            available: { type: 'integer', example: 8 },
            loaned: { type: 'integer', example: 2 },
            total: { type: 'integer', example: 10 },
            overdue: {
              type: 'array',
              items: { $ref: '#/components/schemas/LoanResponse' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autenticação por JWT',
          description: 'Realiza login e retorna token JWT com o perfil do usuário autenticado.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            400: { description: 'E-mail e senha são obrigatórios.' },
            401: { description: 'Credenciais inválidas.' },
          },
        },
      },
      '/api/admin/dashboard': {
        get: {
          tags: ['Admin'],
          summary: 'Dashboard administrativo',
          description: 'Retorna métricas gerais e a lista de empréstimos atrasados. Acesso exclusivo do ADMIN.',
          responses: {
            200: {
              description: 'Dashboard carregado com sucesso.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DashboardResponse' },
                },
              },
            },
            401: { description: 'Token não informado ou inválido.' },
            403: { description: 'Apenas administradores podem executar esta ação.' },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar usuários',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [
            { name: 'role', in: 'query', schema: { type: 'string', example: 'LEITOR' }, description: 'Filtra por perfil.' },
            { name: 'status', in: 'query', schema: { type: 'string', example: 'ATIVO' }, description: 'Filtra por status.' },
            { name: 'q', in: 'query', schema: { type: 'string', example: 'Maria' }, description: 'Busca por nome ou e-mail.' },
          ],
          responses: {
            200: {
              description: 'Lista de usuários.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
            },
            401: { description: 'Autenticação necessária.' },
            403: { description: 'Permissão negada.' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Criar usuário',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Usuário criado.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            400: { description: 'Campos obrigatórios não informados.' },
            409: { description: 'Já existe um usuário com este e-mail.' },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Consultar usuário por ID',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Usuário encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            404: { description: 'Usuário não encontrado.' },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Atualizar usuário',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'BIBLIOTECARIO', 'LEITOR'] },
                    status: { type: 'string', enum: ['ATIVO', 'INATIVO'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Usuário atualizado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            404: { description: 'Usuário não encontrado.' },
            409: { description: 'Já existe um usuário com este e-mail.' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Excluir usuário',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Bibliotecário não pode excluir administradores.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            204: { description: 'Usuário removido.' },
            403: { description: 'Permissão negada.' },
            404: { description: 'Usuário não encontrado.' },
          },
        },
      },
      '/api/books': {
        get: {
          tags: ['Books'],
          summary: 'Listar livros com filtros',
          description: 'Disponível para ADMIN, BIBLIOTECARIO e LEITOR. O LEITOR só visualiza os livros.',
          parameters: [
            { name: 'title', in: 'query', schema: { type: 'string', example: 'Algoritmos' }, description: 'Filtra por título.' },
            { name: 'author', in: 'query', schema: { type: 'string', example: 'Cormen' }, description: 'Filtra por autor.' },
            { name: 'category', in: 'query', schema: { type: 'string', example: 'Computação' }, description: 'Filtra por categoria.' },
            { name: 'isbn', in: 'query', schema: { type: 'string', example: '9780262033848' }, description: 'Filtra por ISBN.' },
            { name: 'availability', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtra por disponibilidade.' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['DISPONIVEL', 'INDISPONIVEL'] }, description: 'Filtra por status do livro.' },
          ],
          responses: {
            200: {
              description: 'Lista de livros.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/BookResponse' } } } },
            },
          },
        },
        post: {
          tags: ['Books'],
          summary: 'Criar livro',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Valida que quantidadeDisponível ≤ quantidadeTotal e ISBN é único.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } },
          },
          responses: {
            201: {
              description: 'Livro criado.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/BookResponse' } } },
            },
            400: { description: 'Campos obrigatórios não informados ou quantidade disponível maior que total.' },
            409: { description: 'Já existe um livro com este ISBN.' },
          },
        },
      },
      '/api/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Consultar livro por ID',
          description: 'Disponível para todos os perfis autenticados.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Livro encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/BookResponse' } } } },
            404: { description: 'Livro não encontrado.' },
          },
        },
        put: {
          tags: ['Books'],
          summary: 'Atualizar livro',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Valida que quantidadeDisponível ≤ quantidadeTotal e ISBN é único.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, author: { type: 'string' }, publisher: { type: 'string' }, publicationYear: { type: 'integer' }, category: { type: 'string' }, isbn: { type: 'string' }, totalQuantity: { type: 'integer' }, availableQuantity: { type: 'integer' }, status: { type: 'string', enum: ['DISPONIVEL', 'INDISPONIVEL'] } } } } },
          },
          responses: {
            200: { description: 'Livro atualizado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/BookResponse' } } } },
            400: { description: 'Quantidade disponível não pode ser maior que total.' },
            404: { description: 'Livro não encontrado.' },
            409: { description: 'Já existe um livro com este ISBN.' },
          },
        },
        delete: {
          tags: ['Books'],
          summary: 'Excluir livro',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            204: { description: 'Livro removido.' },
            404: { description: 'Livro não encontrado.' },
          },
        },
      },
      '/api/readers': {
        get: {
          tags: ['Readers'],
          summary: 'Listar leitores',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [
            { name: 'name', in: 'query', schema: { type: 'string', example: 'Maria' }, description: 'Filtra por nome.' },
            { name: 'cpfOrRa', in: 'query', schema: { type: 'string', example: 'RA-1001' }, description: 'Filtra por CPF/RA.' },
            { name: 'email', in: 'query', schema: { type: 'string', example: 'jose@exemplo.com' }, description: 'Filtra por e-mail.' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ATIVO', 'INATIVO'] }, description: 'Filtra por status.' },
          ],
          responses: {
            200: {
              description: 'Lista de leitores.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ReaderResponse' } } } },
            },
          },
        },
        post: {
          tags: ['Readers'],
          summary: 'Criar leitor',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Reader' } } } },
          responses: {
            201: {
              description: 'Leitor criado.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ReaderResponse' } } },
            },
            400: { description: 'Campos obrigatórios do leitor não informados.' },
          },
        },
      },
      '/api/readers/{id}': {
        get: {
          tags: ['Readers'],
          summary: 'Consultar leitor por ID',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Leitor encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReaderResponse' } } } },
            404: { description: 'Leitor não encontrado.' },
          },
        },
        put: {
          tags: ['Readers'],
          summary: 'Atualizar leitor',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Valida duplicata de CPF/RA e e-mail.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, cpfOrRa: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, status: { type: 'string', enum: ['ATIVO', 'INATIVO'] } } } } },
          },
          responses: {
            200: { description: 'Leitor atualizado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReaderResponse' } } } },
            404: { description: 'Leitor não encontrado.' },
            409: { description: 'CPF/RA ou e-mail já existem.' },
          },
        },
        delete: {
          tags: ['Readers'],
          summary: 'Excluir leitor',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            204: { description: 'Leitor removido.' },
            404: { description: 'Leitor não encontrado.' },
          },
        },
      },
      '/api/loans': {
        get: {
          tags: ['Loans'],
          summary: 'Listar empréstimos com filtros',
          description: 'ADMIN vê tudo. LEITOR vê somente os próprios empréstimos.',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['EM_ABERTO', 'DEVOLVIDO', 'ATRASADO'] }, description: 'Filtra por status.' },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data inicial do empréstimo.' },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data final do empréstimo.' },
            { name: 'readerId', in: 'query', schema: { type: 'integer' }, description: 'Filtra por leitor.' },
            { name: 'bookId', in: 'query', schema: { type: 'integer' }, description: 'Filtra por livro.' },
          ],
          responses: {
            200: {
              description: 'Lista de empréstimos.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LoanResponse' } } } },
            },
          },
        },
        post: {
          tags: ['Loans'],
          summary: 'Criar empréstimo',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Bloqueia leitor inativo ou livro sem disponibilidade.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['readerId', 'bookId'],
                  properties: {
                    readerId: { type: 'integer' },
                    bookId: { type: 'integer' },
                    loanDate: { type: 'string', format: 'date-time' },
                    dueDate: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Empréstimo criado.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanResponse' } } },
            },
            400: { description: 'Dados inválidos, leitor inativo ou livro indisponível.' },
            404: { description: 'Leitor ou livro não encontrado.' },
          },
        },
      },
      '/api/loans/{id}': {
        get: {
          tags: ['Loans'],
          summary: 'Consultar empréstimo por ID',
          description: 'LEITOR só pode consultar os próprios empréstimos.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Empréstimo encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanResponse' } } } },
            403: { description: 'Você só pode consultar seus próprios empréstimos.' },
            404: { description: 'Empréstimo não encontrado.' },
          },
        },
        put: {
          tags: ['Loans'],
          summary: 'Atualizar empréstimo',
          description: 'Disponível para ADMIN e BIBLIOTECARIO.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    loanDate: { type: 'string', format: 'date-time' },
                    dueDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['EM_ABERTO', 'DEVOLVIDO', 'ATRASADO'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Empréstimo atualizado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanResponse' } } } },
            404: { description: 'Empréstimo não encontrado.' },
          },
        },
        delete: {
          tags: ['Loans'],
          summary: 'Excluir empréstimo',
          description: 'Disponível para ADMIN. Uso administrativo.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            204: { description: 'Empréstimo removido.' },
            404: { description: 'Empréstimo não encontrado.' },
          },
        },
      },
      '/api/loans/{id}/return': {
        put: {
          tags: ['Loans'],
          summary: 'Registrar devolução',
          description: 'Disponível para ADMIN e BIBLIOTECARIO. Atualiza o status para DEVOLVIDO e devolve a disponibilidade do livro.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Devolução registrada.', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanResponse' } } } },
            400: { description: 'Este empréstimo já foi devolvido.' },
            404: { description: 'Empréstimo não encontrado.' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJSDoc(options);