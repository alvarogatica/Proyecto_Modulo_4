const express = require('express');
const { Router } = require('express');
const { crearReserva, obtenerTodasLasReservas, obtenerReservasPorQuery, pagarReserva, cancelarReserva, eliminarReserva, editarReserva } = require('../controllers/reservas.controller');
const reservasRouter = express.Router();

reservasRouter.get('/', obtenerTodasLasReservas);
reservasRouter.post('/', crearReserva);
reservasRouter.get('/query', obtenerReservasPorQuery);
reservasRouter.patch('/pagar/:id', pagarReserva);
reservasRouter.patch('/cancelar/:id', cancelarReserva);
reservasRouter.delete('/eliminar/:id', eliminarReserva);
reservasRouter.put('/editar/:id', editarReserva);


module.exports = reservasRouter;