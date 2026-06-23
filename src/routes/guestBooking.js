// src/routes/guestBooking.js
// CRUD completo para a tabela GUEST_BOOKING.
// Liga hóspedes adicionais a uma reserva (além do titular id_holder da booking).
// Tabela: guest_booking(id UUID PK, id_guest UUID FK → guest, id_booking UUID FK → booking)

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /guest-bookings
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id_guest, id_booking } = req.body;

  if (!id_guest || !id_booking) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_guest, id_booking' });
  }

  // Verifica se o hóspede existe
  const guestCheck = await pool.query('SELECT id FROM guest WHERE id = $1', [id_guest]);
  if (guestCheck.rows.length === 0) {
    return res.status(404).json({ erro: 'Hóspede não encontrado.' });
  }

  // Verifica se a reserva existe
  const bookingCheck = await pool.query('SELECT id FROM booking WHERE id = $1', [id_booking]);
  if (bookingCheck.rows.length === 0) {
    return res.status(404).json({ erro: 'Reserva não encontrada.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO guest_booking (id_guest, id_booking) VALUES ($1, $2) RETURNING *`,
      [id_guest, id_booking]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /guest-bookings
// Retorna todas as relações com nomes do hóspede e da reserva
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         gb.id,
         g.id AS id_guest,
         g.national_id,
         b.id,
         r.room_number,
         b.id as id_booking,
         b.status
       FROM guest_booking gb
       JOIN guest   g ON g.id = gb.id_guest
       JOIN booking b ON b.id = gb.id_booking
       JOIN room    r ON r.id = b.id_room
       ORDER BY g.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /guest-bookings/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         gb.id,
         g.name        AS hospede,
         g.national_id AS cpf,
         b.id          AS id_reserva,
         r.room_number AS quarto,
         b.status      AS status_reserva
       FROM guest_booking gb
       JOIN guest   g ON g.id = gb.id_guest
       JOIN booking b ON b.id = gb.id_booking
       JOIN room    r ON r.id = b.id_room
       WHERE gb.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação hóspede-reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /guest-bookings/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id_guest, id_booking } = req.body;

  if (!id_guest || !id_booking) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_guest, id_booking' });
  }

  try {
    const result = await pool.query(
      `UPDATE guest_booking SET id_guest = $1, id_booking = $2 WHERE id = $3 RETURNING *`,
      [id_guest, id_booking, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação hóspede-reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /guest-bookings/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM guest_booking WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação hóspede-reserva não encontrada.' });
    }
    res.json({ mensagem: 'Relação removida com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
