const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Reader = require('./Reader');
const Loan = require('./Loan');

User.hasOne(Reader, {
  foreignKey: {
    name: 'userId',
    allowNull: true,
    unique: true,
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Exemplo no arquivo de associações dos Models
Book.hasMany(Loan, { foreignKey: 'bookId', onDelete: 'CASCADE' });
Loan.belongsTo(Book, { foreignKey: 'bookId' });

Reader.hasMany(Loan, { foreignKey: 'readerId', onDelete: 'CASCADE' });
Loan.belongsTo(Reader, { foreignKey: 'readerId' });

Reader.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: true,
    unique: true,
  },
});

Reader.hasMany(Loan, {
  foreignKey: {
    name: 'readerId',
    allowNull: false,
  },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Book.hasMany(Loan, {
  foreignKey: {
    name: 'bookId',
    allowNull: false,
  },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Loan.belongsTo(Reader, {
  foreignKey: {
    name: 'readerId',
    allowNull: false,
  },
});

Loan.belongsTo(Book, {
  foreignKey: {
    name: 'bookId',
    allowNull: false,
  },
});

module.exports = {
  sequelize,
  User,
  Book,
  Reader,
  Loan,
};