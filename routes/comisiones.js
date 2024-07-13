const express = require('express');
const router = express.Router();
const pool = require('../db');

// Función auxiliar para obtener el porcentaje de comisión
async function obtenerPorcentajeComision(laboratorio, cantidadVentas, medicamentoId) {
    // Primero, verificamos si hay una comisión especial para este medicamento
    const [comisionesEspeciales] = await pool.query(
        'SELECT * FROM comisiones_especiales WHERE medicamento_id = ? AND venta_min <= ?',
        [medicamentoId, cantidadVentas]
    );

    if (comisionesEspeciales.length > 0) {
        return comisionesEspeciales[0].porcentaje;
    }

    // Si no hay comisión especial, buscamos en los rangos generales
    const [rangos] = await pool.query(
        'SELECT * FROM rangos_comisiones WHERE laboratorio = ? AND venta_min <= ? AND venta_max >= ?',
        [laboratorio, cantidadVentas, cantidadVentas]
    );

    if (rangos.length > 0) {
        return rangos[0].porcentaje;
    }

    return 0; // Si no se encuentra ningún rango aplicable
}

router.get('/:profesionalId', async (req, res) => {
    try {
        const { profesionalId } = req.params;
        const { fechaInicio, fechaFin } = req.query;

        // Obtenemos las prescripciones del profesional en el rango de fechas
        const [prescripciones] = await pool.query(`
            SELECT m.laboratorio, m.producto, m.precio_antes_iva, COUNT(*) as cantidad
            FROM prescripciones p
            JOIN medicamentos m ON p.medicamento_id = m.id
            WHERE p.profesional_id = ? AND p.fecha_prescripcion BETWEEN ? AND ?
            GROUP BY m.id
        `, [profesionalId, fechaInicio, fechaFin]);

        let comisionTotal = 0;
        const detalleComisiones = [];

        for (const prescripcion of prescripciones) {
            const porcentaje = await obtenerPorcentajeComision(prescripcion.laboratorio, prescripcion.cantidad, prescripcion.id);
            const comision = (prescripcion.precio_antes_iva * prescripcion.cantidad * porcentaje) / 100;

            comisionTotal += comision;
            detalleComisiones.push({
                producto: prescripcion.producto,
                cantidad: prescripcion.cantidad,
                porcentaje: porcentaje,
                comision: comision
            });
        }

        res.json({
            profesionalId,
            fechaInicio,
            fechaFin,
            comisionTotal,
            detalleComisiones
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al calcular comisiones' });
    }
});

module.exports = router;