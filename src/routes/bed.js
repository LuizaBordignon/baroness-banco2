// src/routes/bed.js
// CRUD completo para a tabela BED (tipo de cama).
// Tabela: bed(id UUID PK, bed_type VARCHAR)

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /beds
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { bed_type } = req.body;

  if (!bed_type) {
    return res.status(400).json({ erro: 'Campo obrigatório: bed_type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bed (bed_type) VALUES ($1) RETURNING *`,
      [bed_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /beds
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM bed ORDER BY bed_type ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /beds/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM bed WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tipo de cama não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /beds/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { bed_type } = req.body;

  if (!bed_type) {
    return res.status(400).json({ erro: 'Campo obrigatório: bed_type' });
  }

  try {
    const result = await pool.query(
      `UPDATE bed SET bed_type = $1 WHERE id = $2 RETURNING *`,
      [bed_type, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tipo de cama não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /beds/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM bed WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tipo de cama não encontrado.' });
    }
    res.json({ mensagem: 'Tipo de cama removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
