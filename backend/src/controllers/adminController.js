const { Op } = require('sequelize');
const { Book, Loan, Reader } = require('../models');

async function getDashboard(req, res) {
  try {
    const available = await Book.sum('availableQuantity') || 0;
    const total = await Book.sum('totalQuantity') || 0;
    const loaned = Math.max(0, total - available);

    const overdue = await Loan.findAll({
      where: {
        [Op.or]: [
          { status: 'ATRASADO' },
          { status: 'EM_ABERTO', dueDate: { [Op.lt]: new Date() } },
        ],
      },
      include: [
        { model: Reader, attributes: ['id', 'name', 'cpfOrRa', 'email'] },
        { model: Book, attributes: ['id', 'title', 'isbn'] },
      ],
      order: [['dueDate', 'ASC']],
    });

    return res.json({ available, loaned, total, overdue });
  } catch (error) {
    console.error('Erro ao montar dashboard:', error);
    return res.status(500).json({ message: 'Erro interno.' });
  }
}

module.exports = {
  getDashboard,
};
