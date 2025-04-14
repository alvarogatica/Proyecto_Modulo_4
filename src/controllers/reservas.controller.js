const fs = require('fs');
const path = require('path');
const rutaDatas = path.join(__dirname, '../data/habitaciones-disponibles.json');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const mediosDePago = require('../data/medios-de-pago.js');

const habitacionesDisponibles = JSON.parse(fs.readFileSync(rutaDatas, 'utf-8'));

const reservas = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/reservas.json'), 'utf-8'));

// obtenemos los datos de la reserva del cuerpo de la solicitud
const crearReserva = (req, res) => {

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
        .filter(reserva => moment(reserva.fecha_hora, moment.ISO_8601).isSame(fechaReserva, 'minute'));

    if (reservasHabitacionSolicitada.length > 0) {
        return res.status(400).send('La habitación solicitada no está disponible en la fecha y hora solicitadas');
    };

    const reserva = {
        id: uuidv4(),
        tipo_habitacion: tipo_habitacion,
        fecha_hora: fechaReserva.toISOString(),
        cliente: cliente,
        estado: 'confirmada',
        precio: habitacionesDisponibles[tipo_habitacion].precio,
    }

    // guardamos la reserva en el archivo de reservas.json
    reservas.push(reserva);
    guardarEnLaBaseDeDatos();

    res.status(201).send(`Reserva recibida para ${tipo_habitacion}`);
}

const obtenerTodasLasReservas = (req, res) => {
    res.status(200).json(reservas);
}

const obtenerReservasPorQuery= (req, res) => {
    const {fecha, cliente, estado} = req.query;
    let reservasFiltradas = reservas;
    if (fecha) {
        const fechaConsulta = moment(fecha, 'DD/MM/YYYY');
        reservasFiltradas = reservasFiltradas.filter(reserva => moment(reserva.fecha_hora, moment.ISO_8601).isSame(fechaConsulta, 'day'));
    }
    if (cliente) {
        reservasFiltradas = reservasFiltradas.filter(reserva => reserva.cliente === cliente);
    }
    if (estado) {
        reservasFiltradas = reservasFiltradas.filter(reserva => reserva.estado === estado);
    }
    return res.status(200).json(reservasFiltradas);
}

const pagarReserva = (req, res) => {
    //ir a buscar si la reserva existe
    const idReserva = req.params.id;
    const reserva = reservas.find(reserva => reserva.id === idReserva);
    if (!reserva) {
        return res.status(404).send('Reserva no encontrada');
    }
    //verificar si el medio de pago es correcto
    const {medio, precio} = req.body;

    const medioDePago = mediosDePago.includes(medio);
    if (!medioDePago) {
        return res.status(400).send('El medio de pago no es correcto');
    }
    // verificar si el monto es correcto
    if (precio !== reserva.precio) {
        return res.status(400).send('El monto no es correcto');
    }
    // verificar si la reserva ya fue pagada
    if (reserva.estado === 'pagada') {
        return res.status(400).send('La reserva ya fue pagada');
    }
    //cambiar el estado de la reserva a pagada
    reserva.estado = 'pagada';
    // guardar la reserva en el archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(reserva => reserva.id === idReserva);
    reservas[posicionEnElArreglo] = reserva;

    guardarEnLaBaseDeDatos();
    
    res.status(200).send('Reserva pagada con éxito');
}

const cancelarReserva = (req, res) => {
    const idReserva = req.params.id;
    const reserva = reservas.find(reserva => reserva.id === idReserva);
    if (!reserva) {
        return res.status(404).send('Reserva no encontrada');
    }
    // verificar si la reserva ya fue pagada
    if (reserva.estado === 'pagada') {
        return res.status(400).send('La reserva ya fue pagada y no se puede cancelar');
    }
    // eliminar la reserva del archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(reserva => reserva.id === idReserva);
    reservas.splice(posicionEnElArreglo, 1);
    
    guardarEnLaBaseDeDatos();
    
    res.status(200).send('Reserva cancelada con éxito');
}

const eliminarReserva = (req, res) => {
    const idReserva = req.params.id;
    const reserva = reservas.find(reserva => reserva.id === idReserva);
    if (!reserva) {
        return res.status(404).send('Reserva no encontrada');
    }
    // eliminar la reserva del archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(reserva => reserva.id === idReserva);
    reservas.splice(posicionEnElArreglo, 1);
    
    guardarEnLaBaseDeDatos();
    
    res.status(200).send('Reserva eliminada con éxito');
}

const guardarEnLaBaseDeDatos = () => {
    fs.writeFileSync(path.join(__dirname, '../data/reservas.json'), JSON.stringify(reservas, null, 2), 'utf-8');
}
    

module.exports = {
    crearReserva,
    obtenerTodasLasReservas,
    obtenerReservasPorQuery,
    pagarReserva,
    cancelarReserva,
    eliminarReserva,
}