// src/routes/product.js
// CRUD completo para a tabela PRODUCTS (produtos do minibar/serviços).
// Tabela: products(id UUID PK, name VARCHAR, storage INTEGER, price NUMERIC)

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// CREATE  →  POST /products
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, storage, price } = req.body;

  if (!name || storage === undefined || price === undefined) {
    return res.status(400).json({ erro: 'Campos obrigatórios: name, storage, price' });
  }
  if (storage < 0) {
    return res.status(400).json({ erro: 'Estoque não pode ser negativo.' });
  }
  if (price <= 0) {
    return res.status(400).json({ erro: 'Preço deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, storage, price) VALUES ($1, $2, $3) RETURNING *`,
      [name, storage, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ALL  →  GET /products
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// READ ONE  →  GET /products/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// UPDATE  →  PUT /products/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { name, storage, price } = req.body;

  if (!name || storage === undefined || price === undefined) {
    return res.status(400).json({ erro: 'Campos obrigatórios: name, storage, price' });
  }
  if (storage < 0) {
    return res.status(400).json({ erro: 'Estoque não pode ser negativo.' });
  }
  if (price <= 0) {
    return res.status(400).json({ erro: 'Preço deve ser maior que zero.' });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, storage = $2, price = $3
       WHERE id = $4
       RETURNING *`,
      [name, storage, price, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE  →  DELETE /products/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.json({ mensagem: 'Produto removido com sucesso.', removido: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
