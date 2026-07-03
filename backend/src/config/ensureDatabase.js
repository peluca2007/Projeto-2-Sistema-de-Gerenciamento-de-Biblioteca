const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '..', '..', '.env');
const exampleEnvPath = path.resolve(__dirname, '..', '..', '.env.example');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (fs.existsSync(exampleEnvPath)) {
  require('dotenv').config({ path: exampleEnvPath });
}

async function ensureDatabaseExists() {
  const databaseName = process.env.DB_NAME || 'biblioteca_db';
  const databaseUser = process.env.DB_USER || 'postgres';
  const databasePassword = process.env.DB_PASSWORD ?? '';
  const databaseHost = process.env.DB_HOST || 'localhost';
  const databasePort = Number(process.env.DB_PORT || 5432);

  const client = new Client({
    host: databaseHost,
    port: databasePort,
    user: databaseUser,
    password: databasePassword,
    database: 'postgres',
  });

  await client.connect();

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
      console.log(`Banco de dados "${databaseName}" criado com sucesso.`);
    }
  } finally {
    await client.end();
  }
}

module.exports = ensureDatabaseExists;