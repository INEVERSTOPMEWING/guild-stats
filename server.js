// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 🌐 Nur diese Domain darf zugreifen:
const allowedOrigins = ['https://mattisweb.de'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS BLOCKED: code 403 Forbidden!'));
    }
  }
}));

app.use(express.json());

// 🛡️ Zusätzlicher Schutz: Blockiere direkte Aufrufe ohne erlaubten Referer/Origin
app.use((req, res, next) => {
  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowed = allowedOrigins[0];

  // 1. Anfragen ohne Origin/Referer (z. B. von cron-job.org) erlauben
  if (!origin && !referer) {
    return next();
  }

  // 2. Anfragen von erlaubter Domain erlauben
  if (
    (origin && origin.startsWith(allowed)) ||
    (referer && referer.startsWith(allowed))
  ) {
    return next();
  }

  // 3. Alles andere blockieren
  res.status(403).json({ error: 'Access only allowed via mattisweb.de or trusted services' });
});

const APIKEY = process.env.HYPIXEL_API_KEY;
const XKEY = process.env.JSONBIN_KEY;

// 🔁 Hypixel Guild-Stats weiterleiten
app.get('/api/guild', async (req, res) => {
  try {
    const name = req.query.name;
    const result = await axios.get(`https://api.hypixel.net/guild?name=${name}&key=${APIKEY}`);
    res.json(result.data);
  } catch (e) {
    res.status(500).json({ error: 'Hypixel Fehler', detail: e.message });
  }
});

// 📥 JSONBin lesen
app.get('/api/jsonbin-read', async (req, res) => {
  try {
    const binId = req.query.id;
    const result = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': XKEY }
    });
    res.json(result.data);
  } catch (e) {
    res.status(500).json({ error: 'JSONBin Read Fehler', detail: e.message });
  }
});

// ✏️ JSONBin schreiben
app.post('/api/jsonbin-write', async (req, res) => {
  try {
    const binId = req.query.id;
    const result = await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, req.body, {
      headers: {
        'X-Master-Key': XKEY,
        'Content-Type': 'application/json'
      }
    });
    res.json(result.data);
  } catch (e) {
    res.status(500).json({ error: 'JSONBin Write Fehler', detail: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy läuft auf Port ${PORT}`));
