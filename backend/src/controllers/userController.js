const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Reader } = require('../models');

function getPlaceholderReaderData(user) {
  return {
    name: user.name,
    email: user.email,
    cpfOrRa: `RA-${user.id}`,
    phone: '(00) 00000-0000',
    address: 'Cadastro automático via usuário do sistema',
    status: user.status,
    userId: user.id,
  };
}

async function syncReaderForUser(user) {
  const reader = await Reader.findOne({
    where: {
      [Op.or]: [
        { userId: user.id },
        { email: user.email },
      ],
    },
  });

  if (user.role !== 'LEITOR') {
    if (reader) {
      if (reader.userId !== user.id) {
        reader.userId = user.id;
      }
      reader.status = 'INATIVO';
      await reader.save();
    }

    return;
  }

  if (!reader) {
    await Reader.create(getPlaceholderReaderData(user));
    return;
  }

  reader.name = user.name;
  reader.email = user.email;
  reader.userId = user.id;
  reader.status = user.status;
  await reader.save();
}

function cleanUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
async function listUsers(req, res) {
  try {
    const { role, status, q } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const users = await User.findAll({ where, order: [['id', 'ASC']] });
    return res.json(users.map(cleanUser));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar usuários.' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json(cleanUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, e-mail, senha e perfil são obrigatórios.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email,
      password: hashedPassword,
      role,
      status: status || 'ATIVO',
    });

    await syncReaderForUser(user);
    return res.status(201).json(cleanUser(user));
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const { name, email, password, role, status } = req.body;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
    }

    if (password) user.password = await bcrypt.hash(password, 10);
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.status = status ?? user.status;

    await user.save();
    await syncReaderForUser(user);
    return res.json(cleanUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (user.role === 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bibliotecário não pode excluir administradores.' });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    // A MÁGICA ESTÁ AQUI: Bloqueia o crash e avisa o front que não pode deletar
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ message: 'Não é possível excluir: este usuário possui empréstimos ou registros vinculados. Mude o status para INATIVO.' });
    }
    return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };