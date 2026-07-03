const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Reader } = require('../models');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: Reader }],
  });

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      readerId: user.Reader?.id || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  );

  return res.json({
    message: 'Login realizado com sucesso.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      readerId: user.Reader?.id || null,
    },
  });
}

module.exports = {
  login,
};