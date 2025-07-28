// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const APIKEY = process.env.HYPIXEL_API_KEY;
const XKEY = process.env.JSONBIN_KEY;

// Hypixel Guild-Stats weiterleiten
app.get('/api/guild', async (req, res) => {
  try {
    const name = req.query.name;
    const result = await axios.get(`https://api.hypixel.net/guild?name=${name}&key=${APIKEY}`);
    res.json(result.data);
  } catch (e) {
    res.status(500).json({ error: 'Hypixel Fehler', detail: e.message });
  }
});

// JSONBin lesen
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

// JSONBin schreiben
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
