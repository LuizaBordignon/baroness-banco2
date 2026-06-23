// server.js
// Ponto de entrada do servidor Express.
// Registra todas as rotas e sobe o servidor na porta definida no .env.

require('dotenv').config();
const express = require('express');
const app = express();

// Interpreta o corpo das requisições como JSON
app.use(express.json());
const cors = require('cors');

app.use(cors());
app.use(express.json());

// =============================================================
//  ROTAS — CRUD das tabelas
// =============================================================
app.use('/guests', require('./src/routes/guest'));
app.use('/employees', require('./src/routes/employee'));
app.use('/rooms', require('./src/routes/room'));
app.use('/beds', require('./src/routes/bed'));
app.use('/products', require('./src/routes/product'));
app.use('/room-beds', require('./src/routes/roomBed'));
app.use('/bookings', require('./src/routes/booking'));
app.use('/guest-bookings', require('./src/routes/guestBooking'));
app.use('/payments', require('./src/routes/payment'));
app.use('/booking-charges', require('./src/routes/bookingCharge'));

// =============================================================
//  ROTAS — Views, Procedures e Functions do banco
// =============================================================
app.use('/db', require('./src/routes/db'));

// =============================================================
//  ROTA RAIZ — lista todos os endpoints disponíveis
// =============================================================
app.get('/', (req, res) => {
  res.json({
    sistema: 'Hotel Baroness — API Backend',
    rotas_crud: {
      guests: { listar: 'GET /guests', buscar: 'GET /guests/:id', criar: 'POST /guests', editar: 'PUT /guests/:id', remover: 'DELETE /guests/:id' },
      employees: { listar: 'GET /employees', buscar: 'GET /employees/:id', criar: 'POST /employees', editar: 'PUT /employees/:id', remover: 'DELETE /employees/:id' },
      rooms: { listar: 'GET /rooms', buscar: 'GET /rooms/:id', criar: 'POST /rooms', editar: 'PUT /rooms/:id', remover: 'DELETE /rooms/:id' },
      beds: { listar: 'GET /beds', buscar: 'GET /beds/:id', criar: 'POST /beds', editar: 'PUT /beds/:id', remover: 'DELETE /beds/:id' },
      products: { listar: 'GET /products', buscar: 'GET /products/:id', criar: 'POST /products', editar: 'PUT /products/:id', remover: 'DELETE /products/:id' },
      room_beds: { listar: 'GET /room-beds', buscar: 'GET /room-beds/:id', criar: 'POST /room-beds', editar: 'PUT /room-beds/:id', remover: 'DELETE /room-beds/:id' },
      bookings: { listar: 'GET /bookings', buscar: 'GET /bookings/:id', criar: 'POST /bookings', editar: 'PUT /bookings/:id', remover: 'DELETE /bookings/:id' },
      guest_bookings: { listar: 'GET /guest-bookings', buscar: 'GET /guest-bookings/:id', criar: 'POST /guest-bookings', editar: 'PUT /guest-bookings/:id', remover: 'DELETE /guest-bookings/:id' },
      payments: { listar: 'GET /payments', buscar: 'GET /payments/:id', criar: 'POST /payments', editar: 'PUT /payments/:id', remover: 'DELETE /payments/:id' },
      booking_charges: { listar: 'GET /booking-charges', buscar: 'GET /booking-charges/:id', criar: 'POST /booking-charges', editar: 'PUT /booking-charges/:id', remover: 'DELETE /booking-charges/:id' },
    },
    rotas_banco: {
      views: {
        reservas_ativas: 'GET  /db/reservas-ativas',
        quartos_disponiveis: 'GET  /db/quartos-disponiveis',
        faturamento: 'GET  /db/faturamento',
      },
      functions: {
        total_reserva: 'GET  /db/total-reserva/:id',
        qtd_quartos_livres: 'GET  /db/qtd-quartos-livres',
      },
      procedures: {
        checkout: 'POST /db/checkout             → body: { id_booking }',
        registrar_pagamento: 'POST /db/registrar-pagamento  → body: { id_booking, payment_type, status }',
      },
    },
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
