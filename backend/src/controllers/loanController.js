const { Op } = require('sequelize');
const { sequelize, Loan, Book, Reader } = require('../models');

function cleanLoan(loan) {
  return {
    id: loan.id,
    loanDate: loan.loanDate,
    dueDate: loan.dueDate,
    returnDate: loan.returnDate,
    status: loan.status,
    readerId: loan.readerId,
    bookId: loan.bookId,
    reader: loan.Reader
      ? {
          id: loan.Reader.id,
          name: loan.Reader.name,
          email: loan.Reader.email,
          status: loan.Reader.status,
        }
      : undefined,
    book: loan.Book
      ? {
          id: loan.Book.id,
          title: loan.Book.title,
          author: loan.Book.author,
          isbn: loan.Book.isbn,
          status: loan.Book.status,
        }
      : undefined,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };
}

async function refreshOverdueStatus(loan) {
  if (loan.status === 'EM_ABERTO' && loan.dueDate < new Date()) {
    loan.status = 'ATRASADO';
    await loan.save();
  }

  return loan;
}

async function listLoans(req, res) {
  const { status, fromDate, toDate, readerId, bookId } = req.query;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (readerId) {
    where.readerId = readerId;
  }

  if (bookId) {
    where.bookId = bookId;
  }

  if (fromDate || toDate) {
    where.loanDate = {};

    if (fromDate) {
      where.loanDate[Op.gte] = new Date(fromDate);
    }

    if (toDate) {
      where.loanDate[Op.lte] = new Date(toDate);
    }
  }

  if (req.user.role === 'LEITOR') {
    if (!req.user.readerId) {
      return res.status(403).json({ message: 'Leitor sem cadastro vinculado.' });
    }

    const reader = await Reader.findByPk(req.user.readerId);
    if (!reader) {
      return res.status(404).json({ message: 'Cadastro de leitor não encontrado para este usuário.' });
    }
    where.readerId = reader.id;
  }

  const loans = await Loan.findAll({
    where,
    include: [Reader, Book],
    order: [['id', 'ASC']],
  });

  const refreshedLoans = [];
  for (const loan of loans) {
    refreshedLoans.push(await refreshOverdueStatus(loan));
  }

  return res.json(refreshedLoans.map(cleanLoan));
}

async function getLoanById(req, res) {
  const loan = await Loan.findByPk(req.params.id, { include: [Reader, Book] });

  if (!loan) {
    return res.status(404).json({ message: 'Empréstimo não encontrado.' });
  }

  if (req.user.role === 'LEITOR') {
    if (!req.user.readerId || req.user.readerId !== loan.readerId) {
      return res.status(403).json({ message: 'Você só pode consultar seus próprios empréstimos.' });
    }
  }

  await refreshOverdueStatus(loan);

  return res.json(cleanLoan(loan));
}

async function createLoan(req, res) {
  const { readerId, bookId, loanDate, dueDate } = req.body;

  if (!readerId || !bookId) {
    return res.status(400).json({ message: 'Reader e Book são obrigatórios.' });
  }

  const transaction = await sequelize.transaction();

  try {
    const reader = await Reader.findByPk(readerId, { transaction });
    const book = await Book.findByPk(bookId, { transaction, lock: transaction.LOCK.UPDATE });

    if (!reader) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Leitor não encontrado.' });
    }

    if (reader.status !== 'ATIVO') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Não é possível emprestar para leitor inativo.' });
    }

    if (!book) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }

    if (Number(book.availableQuantity) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Não há exemplares disponíveis para empréstimo.' });
    }

    const parsedLoanDate = loanDate ? new Date(loanDate) : new Date();
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const loan = await Loan.create({
      readerId,
      bookId,
      loanDate: parsedLoanDate,
      dueDate: parsedDueDate,
      status: parsedDueDate < new Date() ? 'ATRASADO' : 'EM_ABERTO',
    }, { transaction });

    book.availableQuantity -= 1;
    if (book.availableQuantity <= 0) {
      book.status = 'INDISPONIVEL';
    }
    await book.save({ transaction });

    await transaction.commit();

    const createdLoan = await Loan.findByPk(loan.id, { include: [Reader, Book] });
    return res.status(201).json(cleanLoan(createdLoan));
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Erro ao registrar empréstimo.', error: error.message });
  }
}

async function updateLoan(req, res) {
  const loan = await Loan.findByPk(req.params.id, { include: [Book] });

  if (!loan) {
    return res.status(404).json({ message: 'Empréstimo não encontrado.' });
  }

  const allowedFields = ['loanDate', 'dueDate', 'status'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      loan[field] = req.body[field];
    }
  });

  await loan.save();

  return res.json(cleanLoan(await Loan.findByPk(loan.id, { include: [Reader, Book] })));
}

async function returnLoan(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [Book, Reader],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!loan) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Empréstimo não encontrado.' });
    }

    if (loan.status === 'DEVOLVIDO') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Este empréstimo já foi devolvido.' });
    }

    loan.returnDate = new Date();
    loan.status = 'DEVOLVIDO';
    await loan.save({ transaction });

    const book = loan.Book || await Book.findByPk(loan.bookId, { transaction, lock: transaction.LOCK.UPDATE });
    book.availableQuantity += 1;
    if (book.availableQuantity > 0) {
      book.status = 'DISPONIVEL';
    }
    await book.save({ transaction });

    await transaction.commit();

    const updatedLoan = await Loan.findByPk(loan.id, { include: [Reader, Book] });
    return res.json(cleanLoan(updatedLoan));
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Erro ao registrar devolução.', error: error.message });
  }
}

async function deleteLoan(req, res) {
  const loan = await Loan.findByPk(req.params.id);

  if (!loan) {
    return res.status(404).json({ message: 'Empréstimo não encontrado.' });
  }

  await loan.destroy();
  return res.status(204).send();
}

module.exports = {
  listLoans,
  getLoanById,
  createLoan,
  updateLoan,
  returnLoan,
  deleteLoan,
};