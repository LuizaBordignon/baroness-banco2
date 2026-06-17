// src/routes/employee.js
// CRUD completo para a tabela EMPLOYEE (funcionário).
// Tabela: employee(id UUID PK, national_id, name, email, function, age, sex)

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /employees
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { national_id, name, email, function: func, age, sex } = req.body;

  if (!national_id || !name || !email || !func || !age || !sex) {
    return res.status(400).json({ erro: 'Campos obrigatórios: national_id, name, email, function, age, sex' });
  }
  if (age <= 0) {
    return res.status(400).json({ erro: 'Idade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employee (national_id, name, email, function, age, sex)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [national_id, name, email, func, age, sex]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /employees
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM employee ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /employees/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM employee WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /employees/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { national_id, name, email, function: func, age, sex } = req.body;

  if (!national_id || !name || !email || !func || !age || !sex) {
    return res.status(400).json({ erro: 'Campos obrigatórios: national_id, name, email, function, age, sex' });
  }
  if (age <= 0) {
    return res.status(400).json({ erro: 'Idade deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE employee
       SET national_id = $1, name = $2, email = $3, function = $4, age = $5, sex = $6
       WHERE id = $7
       RETURNING *`,
      [national_id, name, email, func, age, sex, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /employees/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM employee WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }
    res.json({ mensagem: 'Funcionário removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
