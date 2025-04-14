const fs = require('fs');
const path = require('path');
const rutaDatas = path.join(__dirname, '../data/habitaciones-disponibles.json');
const habitacionesDisponibles = JSON.parse(fs.readFileSync(rutaDatas, 'utf-8'));

// obtenemos los datos de la reserva del cuerpo de la solicitud
const crearReserva = (req, res) => {
    // const habitacion = req.body.tipo_habitacion;
    // const fecha = req.body.fecha;
    // const cliente = req.body.idCliente;
    const { tipo_habitacion, fecha, idCliente: cliente } = req.body;
// validamos que los datos de la reserva sean correctos
    if (!tipo_habitacion || !fecha || !cliente) {
        return res.status(400).send('Faltan datos para la reserva');
    }
// validamos que la habitacion exista
    const habitacionExiste = Object.keys(habitacionesDisponibles).includes(tipo_habitacion);
    if (!habitacionExiste) {
        return res.status(400).send('La habitación solicitada no existe');
    }          
    res.send(`Reserva recibida para ${tipo_habitacion}`);
}

module.exports = {
    crearReserva
}