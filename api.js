const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const SECRET = process.env.JWT_SECRET || 'cybershield_secret';

function verifierToken(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).json({ erreur: 'Token manquant' });
  jwt.verify(token, SECRET, function(err, decoded) {
    if (err) return res.status(401).json({ erreur: 'Token invalide' });
    req.enqueteur = decoded;
    next();
  });
}

router.post('/login', async (req, res) => {
  try {
    var { email, mot_de_passe } = req.body;
    var result = await pool.query('SELECT * FROM enqueteurs WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ erreur: 'Email incorrect' });
    var enqueteur = result.rows[0];
    var valide = await bcrypt.compare(mot_de_passe, enqueteur.mot_de_passe);
    if (!valide) return res.status(401).json({ erreur: 'Mot de passe incorrect' });
    var token = jwt.sign({ id: enqueteur.id_enqueteur, email: enqueteur.email }, SECRET, { expiresIn: '8h' });
    res.json({ token, enqueteur: { nom: enqueteur.nom, prenom: enqueteur.prenom, role: enqueteur.role } });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/signalements', verifierToken, async (req, res) => {
  try {
    var result = await pool.query('SELECT * FROM signalements ORDER BY date_depot DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.post('/signalements', async (req, res) => {
  try {
    var { type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace } = req.body;
    var code_suivi = 'CS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    var result = await pool.query(
      `INSERT INTO signalements (code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace]
    );
    res.status(201).json({ message: 'Signalement enregistré', code_suivi, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.put('/signalements/:id/statut', verifierToken, async (req, res) => {
  try {
    var { statut } = req.body;
    var result = await pool.query(
      'UPDATE signalements SET statut = $1 WHERE id_signalement = $2 RETURNING *',
      [statut, req.params.id]
    );
    res.json({ message: 'Statut mis à jour', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.get('/recherche', verifierToken, async (req, res) => {
  try {
    var { q } = req.query;
    var result = await pool.query(
      `SELECT s.* FROM signalements s
       LEFT JOIN preuves p ON s.id_signalement = p.id_signalement
       WHERE p.valeur ILIKE $1 OR s.description ILIKE $1 OR s.quartier ILIKE $1
       GROUP BY s.id_signalement`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
