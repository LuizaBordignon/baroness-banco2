// src/routes/db.js
// Rotas que expõem as VIEWS, PROCEDURES e FUNCTIONS criadas no banco de dados.
//
// =============================================================
//  VIEWS disponíveis:
//    GET /db/reservas-ativas       → vw_reservas_ativas
//    GET /db/quartos-disponiveis   → vw_quartos_disponiveis
//    GET /db/faturamento           → vw_faturamento_reservas
//
//  FUNCTIONS disponíveis:
//    GET /db/total-reserva/:id     → fn_total_reserva(uuid)
//    GET /db/qtd-quartos-livres    → fn_quartos_disponiveis()
//
//  PROCEDURES disponíveis:
//    POST /db/checkout             → sp_checkout(id_booking)
//    POST /db/registrar-pagamento  → sp_registrar_pagamento(id_booking, type, status)
// =============================================================

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// ─────────────────────────────────────────────
// VIEW 1: Reservas ativas
// GET /db/reservas-ativas
// ─────────────────────────────────────────────
router.get('/reservas-ativas', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vw_reservas_ativas ORDER BY checkin_realizado DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// VIEW 2: Quartos disponíveis
// GET /db/quartos-disponiveis
// ─────────────────────────────────────────────
router.get('/quartos-disponiveis', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vw_quartos_disponiveis ORDER BY numero_quarto ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// VIEW 3: Faturamento por reserva
// GET /db/faturamento
// ─────────────────────────────────────────────
router.get('/faturamento', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vw_faturamento_reservas ORDER BY total_geral DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// FUNCTION 1: Total a pagar de uma reserva
// GET /db/total-reserva/:id
// ─────────────────────────────────────────────
router.get('/total-reserva/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fn_total_reserva($1) AS total`,
      [req.params.id]
    );
    res.json({ id_reserva: req.params.id, total: result.rows[0].total });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// FUNCTION 2: Quantidade de quartos disponíveis
// GET /db/qtd-quartos-livres
// ─────────────────────────────────────────────
router.get('/qtd-quartos-livres', async (req, res) => {
  try {
    const result = await pool.query(`SELECT fn_quartos_disponiveis() AS quartos_disponiveis`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// PROCEDURE 1: Realizar check-out
// POST /db/checkout
// Body: { "id_booking": "uuid-da-reserva" }
// ─────────────────────────────────────────────
router.post('/checkout', async (req, res) => {
  const { id_booking } = req.body;

  if (!id_booking) {
    return res.status(400).json({ erro: 'Campo obrigatório: id_booking' });
  }

  try {
    await pool.query(`CALL sp_checkout($1)`, [id_booking]);
    res.json({ mensagem: `Check-out da reserva ${id_booking} realizado com sucesso. Quarto liberado.` });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ─────────────────────────────────────────────
// PROCEDURE 2: Registrar pagamento
// POST /db/registrar-pagamento
// Body: { "id_booking": "uuid", "payment_type": "cartao", "status": "paid" }
// ─────────────────────────────────────────────
router.post('/registrar-pagamento', async (req, res) => {
  const { id_booking, payment_type, status } = req.body;

  if (!id_booking || !payment_type || !status) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_booking, payment_type, status' });
  }

  try {
    await pool.query(`CALL sp_registrar_pagamento($1, $2, $3)`, [id_booking, payment_type, status]);
    res.json({ mensagem: `Pagamento via "${payment_type}" registrado para a reserva ${id_booking}.` });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;
