# Proyecto_Modulo_4
## EMPRENDIMIENTO MOTEL
En este proyecto se crea una API para un emprendimiento de motel usando metodos CRUD (Crear, Leer, Actualizar, Borrar), para poder manejar el arreglo de reservas, aplicando filtros de busqueda si se es necesario.
Esta API no sera documentada en SWAGGER Y OpenAPI, ni tampoco se desplegara en render (opcionales)

## Planteamiento
Un nuevo emprendimiento de moteles esta surgiendo pero no tienen como gestionar sus reservas ni los horarios, asi como tampoco los metodos de pago, para ello se requiere crear una API REST que permita, mediante metodos CRUD, el manejo del sistema de reservas.

## Requerimientos
* Utilizar Node.js
* Utilizar Express
* Implementar Endpoints que permitan el manejo de la API

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
* Clona este repositorio de github: 
