const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const swaggerSpec = require('./docs/swagger');
const { authenticateToken } = require('./middlewares/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken, routes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

module.exports = app;