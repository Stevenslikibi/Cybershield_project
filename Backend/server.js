const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, '/tmp/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) { cb(null, true); }
  else { cb(new Error('Seuls JPEG et PNG acceptés'), false); }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get('/', (req, res) => {
  res.json({ message: 'CyberShield API is running' });
});

app.get('/api/signalements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM signalements ORDER BY date_depot DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post('/api/signalements', async (req, res) => {
  try {
    const { type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace } = req.body;
    const code_suivi = 'CS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await pool.query(
      `INSERT INTO signalements (code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [code_suivi, type_arnaque, description, quartier, plateforme, est_anonyme, nom_victime, telephone_victime, email_victime, id_workspace]
    );
    res.status(201).json({ message: 'Signalement enregistré', code_suivi, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.put('/api/signalements/:id/statut', async (req, res) => {
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

app.get('/api/recherche', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(
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
app.post('/api/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const result = await pool.query('SELECT * FROM enqueteurs WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }
    const enqueteur = result.rows[0];
    if (mot_de_passe !== enqueteur.mot_de_passe) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign(
      { id: enqueteur.id_enqueteur, email: enqueteur.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, enqueteur: { nom: enqueteur.nom, prenom: enqueteur.prenom, role: enqueteur.role } });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
