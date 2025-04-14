# Proyecto_Modulo_4
## EMPRENDIMIENTO MOTEL
En este proyecto se crea una API para un emprendimiento de motel usando metodos CRUD (Crear, Leer, Actualizar, Borrar), para poder manejar el arreglo de reservas, aplicando filtros de busqueda si se es necesario.
Esta API no sera documentada en SWAGGER Y OpenAPI, ni tampoco se desplegara en render (opcionales)

## Planteamiento
Un nuevo emprendimiento de moteles esta surgiendo pero no tienen como gestionar sus reservas ni los horarios, asi como tampoco los metodos de pago, para ello se requiere crear una API REST que permita, mediante metodos CRUD, el manejo del sistema de reservas.

## Caracteristicas Principales
* CRUD de emprendimiento motel
* filtro de datos
* validacion de disponibilidad

## Requerimientos
* Utilizar Node.js
* Utilizar Express
* Implementar Endpoints que permitan el manejo de la API
* json (como database)

| Descripcion | Metodo | Endpoint |
|---|---|---|
| Obtener informacion sobre si el servidor esta corriendo | GET | {{URL_BASE}}/ |
| Crear reserva | POST | {{URL_BASE}}/reserva |
| Obtener listado de reservas | GET | {{URL_BASE}}/reserva |
| Consultar con filtros especificos QUERY | GET | {{URL_BASE}}/query? |
| Consulta por metodos de pago por ID | PATCH | {{URL_BASE}}/reserva/pagar |
| Cancelar una reserva por ID | PATCH | {{URL_BASE}}/reserva/cancelar |
| Eliminar una reserva por ID| DEL | {{URL_BASE}}/reserva/eliminar |
| Edita una reserva por ID | PUT | {{URL_BASE}}/reserva/editar |
| Revisa disponibilidad de habitacion | GET | {{URL_BASE}}/reserva/disponibilidad |

## Usar Proyecto
* Clona este repositorio de github: https://github.com/alvarogatica/Proyecto_Modulo_4.git
* Situate en la carpeta "Proyecto_Modulo_4
* Instala las dependencias desde la consola, situado ya en la carpeta principal del proyecto, con el comando  ``npm install``
* Asegurate de tener un archivo .env con las variables de entorno. En este caso es la siguiente ``PORT = 3000``
* Levanta el proyecto con el comando ``npm run dev``

## Detalles de Implementacion
* Definimos arquitectura de carpetas
  * Proyecto_Modulo_4
      * node_modules
      * src
          * controllers
              * healtcheck.controller.js
              * reservas.controller.js
          * data
              * fecha-hora.json
              * habitaciones-disponibles.json
              * medios-de-pago.js
              * reservas.json
          * models
          * routes
              * reservas.route.js
          * index.js
    * .env
    * .gitignore
    * package-lock.json
    * package.json
    * README.md

* Usamos ``package.json`` para establecer los script de ``start`` con ``"node index.js"`` para usarlo en produccion y ``dev`` usando ``"nodemon index.js``
  ```js
  {
  "name": "proyecto_modulo_4",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/alvarogatica/Proyecto_Modulo_4.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/alvarogatica/Proyecto_Modulo_4/issues"
  },
  "homepage": "https://github.com/alvarogatica/Proyecto_Modulo_4#readme",
  "dependencies": {
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "moment": "^2.30.1",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
``

* uso de ``index.js`` como acceso principal

```js
const express = require('express');
const { healthcheck } = require('./controllers/healthcheck.controller');
const { crearReserva, obtenerTodasLasReservas } = require('./controllers/reservas.controller');
const reservasRouter = require('./routes/reservas.routes');
require ('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', healthcheck);

app.use('/reserva', reservasRouter);


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando reservas en el puerto ${port}`);
})
```

* uso de nuestro archivo ``reservas.routes.js`` importando lo necesario
```js
const express = require('express');
const { Router } = require('express');
const { crearReserva, obtenerTodasLasReservas, obtenerReservasPorQuery, pagarReserva, cancelarReserva, eliminarReserva, editarReserva, revisarDisponibilidad} = require('../controllers/reservas.controller');
const reservasRouter = express.Router();

reservasRouter.get('/', obtenerTodasLasReservas);
reservasRouter.post('/', crearReserva);
reservasRouter.get('/query', obtenerReservasPorQuery);
reservasRouter.patch('/pagar/:id', pagarReserva);
reservasRouter.patch('/cancelar/:id', cancelarReserva);
reservasRouter.delete('/eliminar/:id', eliminarReserva);
reservasRouter.put('/editar/:id', editarReserva);
reservasRouter.get('/disponibilidad/', revisarDisponibilidad);


module.exports = reservasRouter;
```
* uso de controlador con ``reservas.controller.js`` utilizando control de errores ``Try{}Catch{}``
```js
const fs = require("fs");
const path = require("path");
const rutaDatas = path.join(__dirname, "../data/habitaciones-disponibles.json");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const mediosDePago = require("../data/medios-de-pago.js");

const habitacionesDisponibles = JSON.parse(fs.readFileSync(rutaDatas, "utf-8"));

const reservas = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/reservas.json"), "utf-8")
);

// obtenemos los datos de la reserva del cuerpo de la solicitud
const crearReserva = (req, res) => {
  try {
    const { tipo_habitacion, fecha, hora, idCliente: cliente } = req.body;
    // validamos que los datos de la reserva sean correctos
    if (!tipo_habitacion || !fecha || !hora || !cliente) {
      return res.status(400).send("Faltan datos para la reserva");
    }
    // validamos que la habitacion exista
    const habitacionExiste = Object.keys(habitacionesDisponibles).includes(
      tipo_habitacion
    );
    if (!habitacionExiste) {
      return res.status(400).send("La habitación solicitada no existe");
    }

    // validamos que la habitacion solicitada este disponible en la fecha solicitada
    const fechaReserva = moment(`${fecha} ${hora}`, "DD/MM/YYYY HH:mm");
    //const duracionReserva = habitacionesDisponibles[tipo_habitacion].duracion;
    //const fechaHoraFinReserva = fechaReserva.clone().add(duracionReserva, 'minutes');
    const reservasHabitacionSolicitada = reservas
      .filter((reserva) => reserva.tipo_habitacion === tipo_habitacion)
      .filter((reserva) =>
        moment(reserva.fecha_hora, moment.ISO_8601).isSame(
          fechaReserva,
          "minute"
        )
      );

    if (reservasHabitacionSolicitada.length > 0) {
      return res
        .status(400)
        .send(
          "La habitación solicitada no está disponible en la fecha y hora solicitadas"
        );
    }

    const reserva = {
      id: uuidv4(),
      tipo_habitacion: tipo_habitacion,
      fecha_hora: fechaReserva.toISOString(),
      cliente: cliente,
      estado: "confirmada",
      precio: habitacionesDisponibles[tipo_habitacion].precio,
    };

    // guardamos la reserva en el archivo de reservas.json
    reservas.push(reserva);
    guardarEnLaBaseDeDatos();

    res.status(201).send(`Reserva recibida para ${tipo_habitacion}`);
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).send("Error al crear la reserva");
  }
};

const obtenerTodasLasReservas = (req, res) => {
  try {
    res.status(200).json(reservas);
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).send("Error al obtener todas las reservas");
  }
};

const obtenerReservasPorQuery = (req, res) => {
  try {
    const { fecha, cliente, estado } = req.query;
    let reservasFiltradas = reservas;
    if (fecha) {
      const fechaConsulta = moment(fecha, "DD/MM/YYYY");
      reservasFiltradas = reservasFiltradas.filter((reserva) =>
        moment(reserva.fecha_hora, moment.ISO_8601).isSame(fechaConsulta, "day")
      );
    }
    if (cliente) {
      reservasFiltradas = reservasFiltradas.filter(
        (reserva) => reserva.cliente === cliente
      );
    }
    if (estado) {
      reservasFiltradas = reservasFiltradas.filter(
        (reserva) => reserva.estado === estado
      );
    }
    return res.status(200).json(reservasFiltradas);
  } catch (error) {
    console.error("Error al obtener reservas por query:", error);
    res.status(500).send("Error al obtener reservas por query");
  }
};

const pagarReserva = (req, res) => {
  //ir a buscar si la reserva existe
  try {
    const idReserva = req.params.id;
    const reserva = reservas.find((reserva) => reserva.id === idReserva);
    if (!reserva) {
      return res.status(404).send("Reserva no encontrada");
    }
    //verificar si el medio de pago es correcto
    const { medio, precio } = req.body;

    const medioDePago = mediosDePago.includes(medio);
    if (!medioDePago) {
      return res.status(400).send("El medio de pago no es correcto");
    }
    // verificar si el monto es correcto
    if (precio !== reserva.precio) {
      return res.status(400).send("El monto no es correcto");
    }
    // verificar si la reserva ya fue pagada
    if (reserva.estado === "pagada") {
      return res.status(400).send("La reserva ya fue pagada");
    }
    //cambiar el estado de la reserva a pagada
    reserva.estado = "pagada";
    // guardar la reserva en el archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(
      (reserva) => reserva.id === idReserva
    );
    reservas[posicionEnElArreglo] = reserva;

    guardarEnLaBaseDeDatos();

    res.status(200).send("Reserva pagada con éxito");
  } catch (error) {
    console.error("Error al pagar la reserva:", error);
    res.status(500).send("Error al pagar la reserva");
  }
};

const cancelarReserva = (req, res) => {
  try {
    const idReserva = req.params.id;
    const reserva = reservas.find((reserva) => reserva.id === idReserva);
    if (!reserva) {
      return res.status(404).send("Reserva no encontrada");
    }
    // verificar si la reserva ya fue pagada
    if (reserva.estado === "pagada") {
      return res
        .status(400)
        .send("La reserva ya fue pagada y no se puede cancelar");
    }
    // eliminar la reserva del archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(
      (reserva) => reserva.id === idReserva
    );
    reservas.splice(posicionEnElArreglo, 1);

    guardarEnLaBaseDeDatos();

    res.status(200).send("Reserva cancelada con éxito");
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    res.status(500).send("Error al cancelar la reserva");
  }
};

const eliminarReserva = (req, res) => {
  try {
    const idReserva = req.params.id;
    const reserva = reservas.find((reserva) => reserva.id === idReserva);
    if (!reserva) {
      return res.status(404).send("Reserva no encontrada");
    }
    // eliminar la reserva del archivo de reservas.json
    const posicionEnElArreglo = reservas.findIndex(
      (reserva) => reserva.id === idReserva
    );
    reservas.splice(posicionEnElArreglo, 1);

    guardarEnLaBaseDeDatos();

    res.status(200).send("Reserva eliminada con éxito");
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);
    res.status(500).send("Error al eliminar la reserva");
  }
};
//metodo para editar una reserva
const editarReserva = (req, res) => {
  try {
    const idReserva = req.params.id;
    const reserva = reservas.find((reserva) => reserva.id === idReserva);
    if (!reserva) {
      return res.status(404).send("Reserva no encontrada");
    }
    // actualizar la reserva con los nuevos datos
    const { tipo_habitacion, fecha, hora, cliente } = req.body;
    if (tipo_habitacion) {
      reserva.tipo_habitacion = tipo_habitacion;
    }
    if (fecha) {
      reserva.fecha_hora = moment(
        `${fecha} ${hora}`,
        "DD/MM/YYYY HH:mm"
      ).toISOString();
    }
    if (cliente) {
      reserva.cliente = cliente;
    }

    guardarEnLaBaseDeDatos();

    res.status(200).send("Reserva editada con éxito");
  } catch (error) {
    console.error("Error al editar la reserva:", error);
    res.status(500).send("Error al editar la reserva");
  }
};

//metodo para revisar disponibilidad de una habitacion
const revisarDisponibilidad = (req, res) => {
  try {
    const { tipo_habitacion, fecha, hora } = req.body;
    if (!tipo_habitacion || !fecha || !hora) {
      return res
        .status(400)
        .send("Faltan datos para la consulta de disponibilidad");
    }
    const habitacionExiste = Object.keys(habitacionesDisponibles).includes(
      tipo_habitacion
    );
    if (!habitacionExiste) {
      return res.status(400).send("La habitación solicitada no existe");
    }
    const fechaReserva = moment(`${fecha} ${hora}`, "DD/MM/YYYY HH:mm");
    const reservasHabitacionSolicitada = reservas
      .filter((reserva) => reserva.tipo_habitacion === tipo_habitacion)
      .filter((reserva) =>
        moment(reserva.fecha_hora, moment.ISO_8601).isSame(
          fechaReserva,
          "minute"
        )
      );

    if (reservasHabitacionSolicitada.length > 0) {
      return res
        .status(400)
        .send(
          "La habitación solicitada no está disponible en la fecha y hora solicitadas"
        );
    }

    res
      .status(200)
      .send("La habitación está disponible en la fecha y hora solicitadas");
  } catch (error) {
    console.error("Error al revisar disponibilidad:", error);
    res.status(500).send("Error al revisar disponibilidad");
  }
};

const guardarEnLaBaseDeDatos = () => {
  fs.writeFileSync(
    path.join(__dirname, "../data/reservas.json"),
    JSON.stringify(reservas, null, 2),
    "utf-8"
  );
};

module.exports = {
  crearReserva,
  obtenerTodasLasReservas,
  obtenerReservasPorQuery,
  pagarReserva,
  cancelarReserva,
  eliminarReserva,
  editarReserva,
  revisarDisponibilidad,
};

```


