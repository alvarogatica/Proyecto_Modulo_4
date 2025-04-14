const express = require('express');
const { healthcheck } = require('./controllers/healthcheck.controller');
const { crearReserva } = require('./controllers/reservas.controller');
require ('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', healthcheck);

app.post('/reserva', crearReserva)

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando reservas en el puerto ${port}`);
})