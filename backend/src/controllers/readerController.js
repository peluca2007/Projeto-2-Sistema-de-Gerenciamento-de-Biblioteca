const { Op } = require('sequelize');
const { Reader } = require('../models');

function cleanReader(reader) {
  return {
    id: reader.id,
    name: reader.name,
    cpfOrRa: reader.cpfOrRa,
    email: reader.email,
    phone: reader.phone,
    address: reader.address,
    status: reader.status,
    createdAt: reader.createdAt,
    updatedAt: reader.updatedAt,
  };
}

async function listReaders(req, res) {
  const { name, cpfOrRa, email, status } = req.query;
  const where = {};

  if (name) {
    where.name = { [Op.iLike]: `%${name}%` };
  }

  if (cpfOrRa) {
    where.cpfOrRa = { [Op.iLike]: `%${cpfOrRa}%` };
  }

  if (email) {
    where.email = { [Op.iLike]: `%${email}%` };
  }

  if (status) {
    where.status = status;
  }

  const readers = await Reader.findAll({ where, order: [['id', 'ASC']] });
  return res.json(readers.map(cleanReader));
}

async function getReaderById(req, res) {
  const reader = await Reader.findByPk(req.params.id);

  if (!reader) {
    return res.status(404).json({ message: 'Leitor não encontrado.' });
  }

  return res.json(cleanReader(reader));
}

async function createReader(req, res) {
  const { name, cpfOrRa, email, phone, address, status } = req.body;

  if (!name || !cpfOrRa || !email || !phone || !address) {
    return res.status(400).json({ message: 'Campos obrigatórios do leitor não informados.' });
  }

  const reader = await Reader.create({
    name,
    cpfOrRa,
    email,
    phone,
    address,
    status: status || 'ATIVO',
  });

  return res.status(201).json(cleanReader(reader));
}

async function updateReader(req, res) {
  const reader = await Reader.findByPk(req.params.id);

  if (!reader) {
    return res.status(404).json({ message: 'Leitor não encontrado.' });
  }

  // Validar se CPF/RA já existe (e é de outro leitor)
  if (req.body.cpfOrRa && req.body.cpfOrRa !== reader.cpfOrRa) {
    const existingReader = await Reader.findOne({ where: { cpfOrRa: req.body.cpfOrRa } });
    if (existingReader) {
      return res.status(409).json({ message: 'Já existe um leitor com este CPF/RA.' });
    }
  }

  // Validar se e-mail já existe (e é de outro leitor)
  if (req.body.email && req.body.email !== reader.email) {
    const existingReader = await Reader.findOne({ where: { email: req.body.email } });
    if (existingReader) {
      return res.status(409).json({ message: 'Já existe um leitor com este e-mail.' });
    }
  }

  ['name', 'cpfOrRa', 'email', 'phone', 'address', 'status'].forEach((field) => {
    if (req.body[field] !== undefined) {
      reader[field] = req.body[field];
    }
  });

  await reader.save();

  return res.json(cleanReader(reader));
}
async function deleteReader(req, res) {
  try {
    const reader = await Reader.findByPk(req.params.id);
    
    if (!reader) {
      return res.status(404).json({ message: 'Leitor não encontrado.' });
    }

    // Tenta deletar
    await reader.destroy();
    return res.status(204).send();

  } catch (error) {
    // Tratamento específico para evitar o crash do servidor
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ 
        message: 'Não é possível excluir este leitor, pois ele possui histórico de empréstimos. Considere Inativá-lo (Soft Delete) em vez de excluir.' 
      });
    }

    // Caso seja outro tipo de erro
    console.error("Erro fatal ao excluir:", error);
    return res.status(500).json({ message: 'Erro interno ao processar a exclusão.' });
  }
}

module.exports = {
  listReaders,
  getReaderById,
  createReader,
  updateReader,
  deleteReader,
};