// src/routes/room.js
// CRUD completo para a tabela ROOM (quarto).
// Tabela: room(id UUID PK, room_number, status BOOLEAN, capacity)
// status TRUE = disponível | FALSE = ocupado

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /rooms
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { room_number, status, capacity } = req.body;

  if (!room_number || status === undefined || !capacity) {
    return res.status(400).json({ erro: 'Campos obrigatórios: room_number, status (true/false), capacity' });
  }
  if (capacity <= 0) {
    return res.status(400).json({ erro: 'Capacidade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO room (room_number, status, capacity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [room_number, status, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /rooms
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM room ORDER BY room_number ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /rooms/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM room WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Quarto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /rooms/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { room_number, status, capacity } = req.body;

  if (!room_number || status === undefined || !capacity) {
    return res.status(400).json({ erro: 'Campos obrigatórios: room_number, status (true/false), capacity' });
  }
  if (capacity <= 0) {
    return res.status(400).json({ erro: 'Capacidade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE room
       SET room_number = $1, status = $2, capacity = $3
       WHERE id = $4
       RETURNING *`,
      [room_number, status, capacity, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Quarto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /rooms/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM room WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Quarto não encontrado.' });
    }
    res.json({ mensagem: 'Quarto removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
