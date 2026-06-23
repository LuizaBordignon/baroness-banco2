// src/routes/roomBed.js
// CRUD completo para a tabela ROOM_BED (relação entre quarto e tipo de cama).
// Tabela: room_bed(id UUID PK, id_bed UUID FK → bed, id_room UUID FK → room)
// Um quarto pode ter vários tipos de cama. Esta tabela faz essa ligação.

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /room-beds
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id_bed, id_room } = req.body;

  if (!id_bed || !id_room) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_bed, id_room' });
  }

  // Verifica se o quarto existe
  const roomCheck = await pool.query('SELECT id FROM room WHERE id = $1', [id_room]);
  if (roomCheck.rows.length === 0) {
    return res.status(404).json({ erro: 'Quarto não encontrado.' });
  }

  // Verifica se a cama existe
  const bedCheck = await pool.query('SELECT id FROM bed WHERE id = $1', [id_bed]);
  if (bedCheck.rows.length === 0) {
    return res.status(404).json({ erro: 'Tipo de cama não encontrado.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO room_bed (id_bed, id_room) VALUES ($1, $2) RETURNING *`,
      [id_bed, id_room]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /room-beds
// Lista todas as relações com os dados do quarto e da cama
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rb.id, r.id as id_room, b.id as id_bed
       FROM room_bed rb
       JOIN room r ON r.id = rb.id_room
       JOIN bed  b ON b.id = rb.id_bed
       ORDER BY r.room_number ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /room-beds/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rb.id, r.room_number, b.bed_type
       FROM room_bed rb
       JOIN room r ON r.id = rb.id_room
       JOIN bed  b ON b.id = rb.id_bed
       WHERE rb.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação quarto-cama não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /room-beds/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id_bed, id_room } = req.body;

  if (!id_bed || !id_room) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_bed, id_room' });
  }

  try {
    const result = await pool.query(
      `UPDATE room_bed SET id_bed = $1, id_room = $2 WHERE id = $3 RETURNING *`,
      [id_bed, id_room, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação quarto-cama não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /room-beds/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM room_bed WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Relação quarto-cama não encontrada.' });
    }
    res.json({ mensagem: 'Relação removida com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
