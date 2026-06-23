// src/routes/guest.js
// CRUD completo para a tabela GUEST (hóspede).
// Tabela: guest(id UUID PK, national_id, name, age, sex)

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /guests
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { national_id, name, age, sex } = req.body;

  if (!national_id || !name || !age || !sex) {
    return res.status(400).json({ erro: 'Campos obrigatórios: national_id, name, age, sex' });
  }
  if (age <= 0) {
    return res.status(400).json({ erro: 'Idade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO guest (national_id, name, age, sex)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [national_id, name, age, sex]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /guests
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM guest ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /guests/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM guest WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Hóspede não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /guests/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { national_id, name, age, sex } = req.body;

  if (!national_id || !name || !age || !sex) {
    return res.status(400).json({ erro: 'Campos obrigatórios: national_id, name, age, sex' });
  }
  if (age <= 0) {
    return res.status(400).json({ erro: 'Idade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE guest
       SET national_id = $1, name = $2, age = $3, sex = $4
       WHERE id = $5
       RETURNING *`,
      [national_id, name, age, sex, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Hóspede não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /guests/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM guest WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Hóspede não encontrado.' });
    }
    res.json({ mensagem: 'Hóspede removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
