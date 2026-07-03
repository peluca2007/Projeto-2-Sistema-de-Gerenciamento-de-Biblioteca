const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  publisher: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('DISPONIVEL', 'INDISPONIVEL'),
    allowNull: false,
    defaultValue: 'DISPONIVEL',
  },
}, {
  tableName: 'books',
  timestamps: true,
});

module.exports = Book;