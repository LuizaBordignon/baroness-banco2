// src/routes/booking.js
// CRUD completo para a tabela BOOKING (reserva).
//
// Tabela: booking(
//   id UUID PK,
//   id_holder UUID FK → guest,
//   id_room UUID FK → room,
//   id_employee UUID FK → employee,
//   check_in DATE,
//   scheduled_check_in DATE NOT NULL,
//   check_out DATE,
//   scheduled_check_out DATE NOT NULL,
//   price NUMERIC,
//   status VARCHAR  →  'active' | 'finished' | 'cancelled'
// )
//
// ATENÇÃO: O banco possui triggers que protegem esta tabela:
//   - trg_ocupar_quarto              → ao INSERT, verifica se quarto está livre e o ocupa
//   - trg_bloquear_edicao_reserva    → bloqueia UPDATE em reservas 'finished' ou 'cancelled'

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /bookings
// O trigger trg_ocupar_quarto dispara automaticamente no banco.
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    id_holder,
    id_room,
    id_employee,
    scheduled_check_in,
    scheduled_check_out,
    price,
    status
  } = req.body;

  if (!id_holder || !id_room || !id_employee || !scheduled_check_in || !scheduled_check_out || !price || !status) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: id_holder, id_room, id_employee, scheduled_check_in, scheduled_check_out, price, status'
    });
  }

  if (price <= 0) {
    return res.status(400).json({ erro: 'Preço da diária deve ser maior que zero.' });
  }

  const statusValidos = ['active', 'finished', 'cancelled'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido. Use: active, finished ou cancelled.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO booking
         (id_holder, id_room, id_employee, scheduled_check_in, scheduled_check_out, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id_holder, id_room, id_employee, scheduled_check_in, scheduled_check_out, price, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Mensagem de erro do trigger chega aqui (ex: quarto indisponível)
    res.status(400).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /bookings
// Retorna todas as reservas com nome do hóspede, quarto e funcionário
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id,
         g.name        AS titular,
         r.room_number AS quarto,
         e.name        AS atendente,
         b.check_in,
         b.scheduled_check_in,
         b.check_out,
         b.scheduled_check_out,
         b.price,
         b.status
       FROM booking b
       JOIN guest    g ON g.id = b.id_holder
       JOIN room     r ON r.id = b.id_room
       JOIN employee e ON e.id = b.id_employee
       ORDER BY b.scheduled_check_in DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /bookings/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id,
         g.name        AS titular,
         r.room_number AS quarto,
         e.name        AS atendente,
         b.check_in,
         b.scheduled_check_in,
         b.check_out,
         b.scheduled_check_out,
         b.price,
         b.status
       FROM booking b
       JOIN guest    g ON g.id = b.id_holder
       JOIN room     r ON r.id = b.id_room
       JOIN employee e ON e.id = b.id_employee
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /bookings/:id
// O trigger trg_bloquear_edicao_reserva impede edição de reservas
// com status 'finished' ou 'cancelled' — o banco retorna erro automaticamente.
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const {
    id_holder,
    id_room,
    id_employee,
    check_in,
    scheduled_check_in,
    check_out,
    scheduled_check_out,
    price,
    status
  } = req.body;

  if (!id_holder || !id_room || !id_employee || !scheduled_check_in || !scheduled_check_out || !price || !status) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: id_holder, id_room, id_employee, scheduled_check_in, scheduled_check_out, price, status'
    });
  }

  if (price <= 0) {
    return res.status(400).json({ erro: 'Preço da diária deve ser maior que zero.' });
  }

  const statusValidos = ['active', 'finished', 'cancelled'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido. Use: active, finished ou cancelled.' });
  }

  try {
    const result = await pool.query(
      `UPDATE booking
       SET id_holder           = $1,
           id_room             = $2,
           id_employee         = $3,
           check_in            = $4,
           scheduled_check_in  = $5,
           check_out           = $6,
           scheduled_check_out = $7,
           price               = $8,
           status              = $9
       WHERE id = $10
       RETURNING *`,
      [id_holder, id_room, id_employee, check_in || null, scheduled_check_in,
       check_out || null, scheduled_check_out, price, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    // Mensagem de erro do trigger chega aqui (ex: reserva já finalizada)
    res.status(400).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /bookings/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM booking WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Reserva não encontrada.' });
    }
    res.json({ mensagem: 'Reserva removida com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
