require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const bootstrapAdmin = require('./config/bootstrapAdmin');
const ensureDatabaseExists = require('./config/ensureDatabase');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await bootstrapAdmin();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

startServer();