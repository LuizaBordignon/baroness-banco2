// src/routes/payment.js
// CRUD completo para a tabela PAYMENT (pagamento).
// Tabela: payment(id UUID PK, id_booking UUID FK, payment_date DATE, payment_type VARCHAR, status VARCHAR)
//
// ATENÇÃO: A procedure sp_registrar_pagamento no banco já valida duplicidade.
// O POST aqui é o CRUD direto. A rota /checkout e /registrar-pagamento
// chamam as procedures do banco (veja routes/procedures.js).

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /payments
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id_booking, payment_date, payment_type, status } = req.body;

  if (!id_booking || !payment_date || !payment_type || !status) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: id_booking, payment_date, payment_type, status'
    });
  }

  // Verifica se a reserva existe
  const bookingCheck = await pool.query('SELECT id FROM booking WHERE id = $1', [id_booking]);
  if (bookingCheck.rows.length === 0) {
    return res.status(404).json({ erro: 'Reserva não encontrada.' });
  }

  // Verifica se já existe pagamento para essa reserva
  const payCheck = await pool.query('SELECT id FROM payment WHERE id_booking = $1', [id_booking]);
  if (payCheck.rows.length > 0) {
    return res.status(400).json({ erro: 'Já existe um pagamento registrado para esta reserva.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO payment (id_booking, payment_date, payment_type, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_booking, payment_date, payment_type, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /payments
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         g.name,
         r.room_number,
         p.payment_date,
         p.payment_type,
         b.id AS id_booking,
         p.status
       FROM payment p
       JOIN booking b ON b.id = p.id_booking
       JOIN guest   g ON g.id = b.id_holder
       JOIN room    r ON r.id = b.id_room
       ORDER BY p.payment_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /payments/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         g.name        AS titular,
         r.room_number AS quarto,
         p.payment_date,
         p.payment_type,
         p.status
       FROM payment p
       JOIN booking b ON b.id = p.id_booking
       JOIN guest   g ON g.id = b.id_holder
       JOIN room    r ON r.id = b.id_room
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /payments/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { payment_date, payment_type, status } = req.body;

  if (!payment_date || !payment_type || !status) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: payment_date, payment_type, status'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE payment
       SET payment_date = $1, payment_type = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [payment_date, payment_type, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /payments/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM payment WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }
    res.json({ mensagem: 'Pagamento removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
