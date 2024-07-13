const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { idProf, password } = req.body;
    
    // Buscar el profesional en la base de datos
    const [rows] = await pool.execute('SELECT * FROM profesionales WHERE idProf = ?', [idProf]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const profesional = rows[0];
    
    // Aquí deberías verificar la contraseña, pero como no tenemos contraseñas en nuestro esquema actual,
    // simplemente generaremos un token
    
    const token = jwt.sign({ id: profesional.id, idProf: profesional.idProf }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, profesional: { id: profesional.id, idProf: profesional.idProf, nombre: profesional.nombre } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;