const fs = require('fs');
const path = require('path');
const rutaDatas = path.join(__dirname, '../data/habitaciones-disponibles.json');
const moment = require('moment');

const habitacionesDisponibles = JSON.parse(fs.readFileSync(rutaDatas, 'utf-8'));

const reservas = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/reservas.json'), 'utf-8'));

// obtenemos los datos de la reserva del cuerpo de la solicitud
const crearReserva = (req, res) => {
    // const habitacion = req.body.tipo_habitacion;
    // const fecha = req.body.fecha;
    // const cliente = req.body.idCliente;
    const { tipo_habitacion, fecha, hora, idCliente: cliente } = req.body;
// validamos que los datos de la reserva sean correctos
    if (!tipo_habitacion || !fecha || !hora || !cliente) {
        return res.status(400).send('Faltan datos para la reserva');
    }
// validamos que la habitacion exista
    const habitacionExiste = Object.keys(habitacionesDisponibles).includes(tipo_habitacion);
    if (!habitacionExiste) {
        return res.status(400).send('La habitación solicitada no existe');
    }

// validamos que la habitacion solicitada este disponible en la fecha solicitada
    const fechaReserva = moment(`${fecha} ${hora}`, 'DD/MM/YYYY HH:mm');
    //const duracionReserva = habitacionesDisponibles[tipo_habitacion].duracion;
    //const fechaHoraFinReserva = fechaReserva.clone().add(duracionReserva, 'minutes');
    const reservasHabitacionSolicitada = reservas
        .filter(reserva => reserva.tipo_habitacion === tipo_habitacion)
        .filter(reserva => moment(reserva.fecha_hora).isSame(fechaReserva));

    if (reservasHabitacionSolicitada.length > 0) {
        return res.status(400).send('La habitación solicitada no está disponible en la fecha y hora solicitadas');
    }

    res.send(`Reserva recibida para ${tipo_habitacion}`);
}

module.exports = {
    crearReserva
}