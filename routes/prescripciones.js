const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { profesional_id, medicamento_id, fecha_prescripcion } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO prescripciones (profesional_id, medicamento_id, fecha_prescripcion) VALUES (?, ?, ?)',
      [profesional_id, medicamento_id, fecha_prescripcion]
    );
    res.status(201).json({ id: result.insertId, message: 'Prescripción registrada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar prescripción' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pr.nombre as profesional_nombre, m.producto as medicamento_nombre
      FROM prescripciones p
      JOIN profesionales pr ON p.profesional_id = pr.id
      JOIN medicamentos m ON p.medicamento_id = m.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener prescripciones' });
  }
});

module.exports = router;