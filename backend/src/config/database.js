const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '..', '..', '.env');
const exampleEnvPath = path.resolve(__dirname, '..', '..', '.env.example');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (fs.existsSync(exampleEnvPath)) {
  require('dotenv').config({ path: exampleEnvPath });
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'biblioteca_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD ?? '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;