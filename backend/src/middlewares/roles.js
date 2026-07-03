function allowAdminOrLibrarian(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Autenticação necessária.' });
  }

  if (req.user.role === 'ADMIN' || req.user.role === 'BIBLIOTECARIO') {
    return next();
  }

  return res.status(403).json({ message: 'Permissão negada.' });
}

function allowAdminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Autenticação necessária.' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  return res.status(403).json({ message: 'Apenas administradores podem executar esta ação.' });
}

module.exports = {
  allowAdminOrLibrarian,
  allowAdminOnly,
};