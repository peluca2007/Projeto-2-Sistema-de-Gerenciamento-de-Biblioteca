const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reader = sequelize.define('Reader', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  cpfOrRa: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  tableName: 'readers',
  timestamps: true,
});

module.exports = Reader;