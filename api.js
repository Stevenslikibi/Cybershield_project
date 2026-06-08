const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

router.get('/signalements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM signalements ORDER BY date_depot DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.post('/signalements', async (req, res) => {
  try {
    const { type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace } = req.body;

    const code_suivi = 'CS-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const result = await pool.query(
      `INSERT INTO signalements (code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace]
    );

    res.status(201).json({ message: 'Signalement enregistré', code_suivi, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/signalements/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM signalements WHERE id_signalement = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Dossier introuvable' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.put('/signalements/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const result = await pool.query(
      'UPDATE signalements SET statut = $1 WHERE id_signalement = $2 RETURNING *',
      [statut, req.params.id]
    );
    res.json({ message: 'Statut mis à jour', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/signalements/suivi/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT code_suivi, statut, type_arnaque, date_depot FROM signalements WHERE code_suivi = $1', [req.params.code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Code introuvable' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/workspaces', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workspaces');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/enqueteurs', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_enqueteur, nom, prenom, email, role, id_workspace FROM enqueteurs');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/suspects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suspects ORDER BY nombre_signalements DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/recherche', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(
      `SELECT s.* FROM signalements s
       LEFT JOIN preuves p ON s.id_signalement = p.id_signalement
       WHERE p.valeur ILIKE $1
       OR s.description ILIKE $1
       OR s.quartier ILIKE $1
       GROUP BY s.id_signalement`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
