const { Router } = require('express');
const { crearReserva, obtenerTodasLasReservas } = require('../controllers/reservas.controller');
const reservasRouter = Router();

reservasRouter.get('/', obtenerTodasLasReservas);
reservasRouter.post('/', crearReserva);

module.exports = reservasRouter;