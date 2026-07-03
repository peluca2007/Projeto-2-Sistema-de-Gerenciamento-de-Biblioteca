const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'BIBLIOTECARIO', 'LEITOR'),
    allowNull: false,
    defaultValue: 'LEITOR',
  },
  status: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;