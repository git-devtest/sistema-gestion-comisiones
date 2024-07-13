const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Farmacia Comisiones' });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Importar rutas
const authRoutes = require('./routes/auth');
const medicamentosRoutes = require('./routes/medicamentos');
const profesionalesRoutes = require('./routes/profesionales');
const prescripcionesRoutes = require('./routes/prescripciones');
const comisionesRoutes = require('./routes/comisiones');

app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', authMiddleware, medicamentosRoutes);
app.use('/api/profesionales', authMiddleware, profesionalesRoutes);
app.use('/api/prescripciones', authMiddleware, prescripcionesRoutes);
app.use('/api/comisiones', authMiddleware, comisionesRoutes);