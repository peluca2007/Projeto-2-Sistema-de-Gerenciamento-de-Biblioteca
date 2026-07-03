const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Reader, Book, Loan } = require('../models');

async function ensureUser({ name, email, password, role }) {
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    return existing;
  }

  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    status: 'ATIVO',
  });
}

async function ensureReader({ name, cpfOrRa, email, phone, address, userId = null, status = 'ATIVO' }) {
  const existing = await Reader.findOne({ where: { email } });

  if (existing) {
    if (userId && existing.userId !== userId) {
      existing.userId = userId;
      await existing.save();
    }
    return existing;
  }

  return Reader.create({
    name,
    cpfOrRa,
    email,
    phone,
    address,
    userId,
    status,
  });
}

async function ensureBook(bookData) {
  const existing = await Book.findOne({ where: { isbn: bookData.isbn } });

  if (existing) {
    return existing;
  }

  return Book.create({
    ...bookData,
    status: bookData.availableQuantity > 0 ? 'DISPONIVEL' : 'INDISPONIVEL',
  });
}

async function ensureLoan({ reader, book, loanDate, dueDate, returnDate = null }) {
  const existing = await Loan.findOne({
    where: {
      readerId: reader.id,
      bookId: book.id,
      loanDate,
      dueDate,
    },
  });

  if (existing) {
    return existing;
  }

  const status = returnDate ? 'DEVOLVIDO' : (new Date(dueDate) < new Date() ? 'ATRASADO' : 'EM_ABERTO');

  return Loan.create({
    readerId: reader.id,
    bookId: book.id,
    loanDate,
    dueDate,
    returnDate,
    status,
  });
}

async function bootstrapAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@biblioteca.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  await ensureUser({
    name: 'Administrador',
    email: adminEmail,
    password: adminPassword,
    role: 'ADMIN',
  });

  await ensureUser({
    name: 'Bibliotecário',
    email: 'biblio@biblioteca.com',
    password: 'Biblio@123',
    role: 'BIBLIOTECARIO',
  });

  const leitorPrincipal = await ensureUser({
    name: 'Leitor Exemplo 1',
    email: 'leitor1@biblioteca.com',
    password: 'Leitor@123',
    role: 'LEITOR',
  });

  const leitorSecundario = await ensureUser({
    name: 'Leitor Exemplo 2',
    email: 'leitor2@biblioteca.com',
    password: 'Leitor@456',
    role: 'LEITOR',
  });

  const readerPrincipal = await ensureReader({
    name: leitorPrincipal.name,
    cpfOrRa: 'RA-1001',
    email: leitorPrincipal.email,
    phone: '(11) 90000-1001',
    address: 'Rua das Bibliotecas, 101',
    userId: leitorPrincipal.id,
  });

  const readerSecundario = await ensureReader({
    name: leitorSecundario.name,
    cpfOrRa: 'RA-1002',
    email: leitorSecundario.email,
    phone: '(11) 90000-1002',
    address: 'Avenida dos Livros, 202',
    userId: leitorSecundario.id,
  });

  const livros = {
    algoritmo: await ensureBook({
      title: 'Introdução a Algoritmos',
      author: 'Cormen',
      publisher: 'Editora A',
      publicationYear: 2009,
      category: 'Computação',
      isbn: '9780262033848',
      totalQuantity: 5,
      availableQuantity: 5,
    }),
    bancoDados: await ensureBook({
      title: 'Design de Banco de Dados',
      author: 'Elmasri',
      publisher: 'Editora B',
      publicationYear: 2016,
      category: 'Banco de Dados',
      isbn: '9780133970777',
      totalQuantity: 2,
      availableQuantity: 2,
    }),
    engenharia: await ensureBook({
      title: 'Engenharia de Software',
      author: 'Pressman',
      publisher: 'Editora C',
      publicationYear: 2014,
      category: 'Engenharia',
      isbn: '9780073375970',
      totalQuantity: 3,
      availableQuantity: 3,
    }),
  };

  await ensureLoan({
    reader: readerPrincipal,
    book: livros.algoritmo,
    loanDate: new Date('2026-06-10T10:00:00.000Z'),
    dueDate: new Date('2026-06-24T10:00:00.000Z'),
  });

  await ensureLoan({
    reader: readerSecundario,
    book: livros.bancoDados,
    loanDate: new Date('2026-06-20T10:00:00.000Z'),
    dueDate: new Date('2026-07-05T10:00:00.000Z'),
  });

  const devolvidoExists = await Loan.findOne({ where: { status: 'DEVOLVIDO' } });

  if (!devolvidoExists) {
    await Loan.create({
      readerId: readerPrincipal.id,
      bookId: livros.engenharia.id,
      loanDate: new Date('2026-05-10T10:00:00.000Z'),
      dueDate: new Date('2026-05-24T10:00:00.000Z'),
      returnDate: new Date('2026-05-20T10:00:00.000Z'),
      status: 'DEVOLVIDO',
    });
  }

  const seededBooks = [livros.algoritmo, livros.bancoDados, livros.engenharia];

  for (const book of seededBooks) {
    const activeLoans = await Loan.count({
      where: {
        bookId: book.id,
        status: {
          [Op.in]: ['EM_ABERTO', 'ATRASADO'],
        },
      },
    });

    book.availableQuantity = Math.max(0, book.totalQuantity - activeLoans);
    book.status = book.availableQuantity > 0 ? 'DISPONIVEL' : 'INDISPONIVEL';
    await book.save();
  }
}

module.exports = bootstrapAdmin;