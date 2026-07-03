const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  loanDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('EM_ABERTO', 'DEVOLVIDO', 'ATRASADO'),
    allowNull: false,
    defaultValue: 'EM_ABERTO',
  },
}, {
  tableName: 'loans',
  timestamps: true,
});

module.exports = Loan;