const express = require('express');
const { Router } = require('express');
const { crearReserva, obtenerTodasLasReservas, obtenerReservasPorQuery } = require('../controllers/reservas.controller');
const reservasRouter = express.Router();

reservasRouter.get('/', obtenerTodasLasReservas);
reservasRouter.post('/', crearReserva);
reservasRouter.get('/query', obtenerReservasPorQuery);

module.exports = reservasRouter;