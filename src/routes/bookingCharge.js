// src/routes/bookingCharge.js
// CRUD completo para a tabela BOOKING_CHARGES (produtos consumidos na reserva).
// Tabela: booking_charges(id UUID PK, id_product UUID FK, id_booking UUID FK, quantity INTEGER)
//
// ATENÇÃO: O trigger trg_verificar_estoque dispara no INSERT:
//   → valida se produto existe
//   → valida se quantity > 0
//   → valida se há estoque suficiente
//   → desconta do estoque automaticamente

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /booking-charges
// O trigger trg_verificar_estoque dispara automaticamente no banco.
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id_product, id_booking, quantity } = req.body;

  if (!id_product || !id_booking || !quantity) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_product, id_booking, quantity' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO booking_charges (id_product, id_booking, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_product, id_booking, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Erros do trigger chegam aqui (estoque insuficiente, produto não encontrado, etc.)
    res.status(400).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /booking-charges
// Retorna todos os lançamentos com nome do produto e quarto
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         bc.id,
         p.id as id_product,
         p.price,
         bc.quantity,
         (p.price * bc.quantity) AS subtotal,
         r.room_number,
         b.id AS id_booking,
         b.status
       FROM booking_charges bc
       JOIN products p ON p.id = bc.id_product
       JOIN booking  b ON b.id = bc.id_booking
       JOIN room     r ON r.id = b.id_room
       ORDER BY r.room_number ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /booking-charges/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         bc.id,
         p.name,
         p.price,
         bc.quantity ,
         (p.price * bc.quantity),
         r.room_number,
         b.id AS id_booking,
         p.id AS id_product,
         b.status
       FROM booking_charges bc
       JOIN products p ON p.id = bc.id_product
       JOIN booking  b ON b.id = bc.id_booking
       JOIN room     r ON r.id = b.id_room
       WHERE bc.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /booking-charges/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id_product, id_booking, quantity } = req.body;

  if (!id_product || !id_booking || !quantity) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_product, id_booking, quantity' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE booking_charges
       SET id_product = $1, id_booking = $2, quantity = $3
       WHERE id = $4
       RETURNING *`,
      [id_product, id_booking, quantity, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /booking-charges/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM booking_charges WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }
    res.json({ mensagem: 'Lançamento removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
