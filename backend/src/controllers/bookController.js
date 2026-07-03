const { Op } = require('sequelize');
const { Book } = require('../models');

function cleanBook(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    publicationYear: book.publicationYear,
    category: book.category,
    isbn: book.isbn,
    totalQuantity: book.totalQuantity,
    availableQuantity: book.availableQuantity,
    status: book.status,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}

function normalizeBookStatus(book) {
  const available = Number(book.availableQuantity) > 0;
  book.status = available ? 'DISPONIVEL' : 'INDISPONIVEL';
  return book;
}

async function listBooks(req, res) {
  const { title, author, category, isbn, availability, status } = req.query;

  const where = {};

  if (title) {
    where.title = { [Op.iLike]: `%${title}%` };
  }

  if (author) {
    where.author = { [Op.iLike]: `%${author}%` };
  }

  if (category) {
    where.category = { [Op.iLike]: `%${category}%` };
  }

  if (isbn) {
    where.isbn = { [Op.iLike]: `%${isbn}%` };
  }

  if (availability === 'true') {
    where.availableQuantity = { [Op.gt]: 0 };
  }

  if (availability === 'false') {
    where.availableQuantity = { [Op.lte]: 0 };
  }

  if (status) {
    where.status = status;
  }

  const books = await Book.findAll({ where, order: [['id', 'ASC']] });

  return res.json(books.map((book) => cleanBook(normalizeBookStatus(book))));
}

async function getBookById(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({ message: 'Livro não encontrado.' });
  }

  return res.json(cleanBook(normalizeBookStatus(book)));
}

async function createBook(req, res) {
  const {
    title,
    author,
    publisher,
    publicationYear,
    category,
    isbn,
    totalQuantity,
    availableQuantity,
    status,
  } = req.body;

  if (!title || !author || !publisher || !publicationYear || !category || !isbn) {
    return res.status(400).json({ message: 'Campos obrigatórios do livro não informados.' });
  }

  const parsedTotal = Number(totalQuantity ?? 1);
  const parsedAvailable = Number(availableQuantity ?? totalQuantity ?? 1);

  // Validar que availableQuantity nunca ultrapassa totalQuantity
  if (parsedAvailable > parsedTotal) {
    return res.status(400).json({ message: 'Quantidade disponível não pode ser maior que a quantidade total.' });
  }

  const book = await Book.create({
    title,
    author,
    publisher,
    publicationYear,
    category,
    isbn,
    totalQuantity: parsedTotal,
    availableQuantity: parsedAvailable,
    status: status || 'DISPONIVEL',
  });

  normalizeBookStatus(book);
  await book.save();

  return res.status(201).json(cleanBook(book));
}

async function updateBook(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({ message: 'Livro não encontrado.' });
  }

  // Validar se ISBN já existe (e é de outro livro)
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const existingBook = await Book.findOne({ where: { isbn: req.body.isbn } });
    if (existingBook) {
      return res.status(409).json({ message: 'Já existe um livro com este ISBN.' });
    }
  }

  const fields = [
    'title',
    'author',
    'publisher',
    'publicationYear',
    'category',
    'isbn',
    'totalQuantity',
    'availableQuantity',
    'status',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      book[field] = req.body[field];
    }
  });

  // Validar que availableQuantity nunca ultrapassa totalQuantity
  if (Number(book.availableQuantity) > Number(book.totalQuantity)) {
    return res.status(400).json({ message: 'Quantidade disponível não pode ser maior que a quantidade total.' });
  }

  if (req.body.availableQuantity !== undefined || req.body.totalQuantity !== undefined) {
    normalizeBookStatus(book);
  }

  await book.save();

  return res.json(cleanBook(book));
}

async function deleteBook(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({ message: 'Livro não encontrado.' });
  }

  await book.destroy();
  return res.status(204).send();
}

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};