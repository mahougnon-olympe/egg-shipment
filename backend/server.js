require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const initSockets = require('./sockets');

const authRoutes = require('./routes/auth');
const boutiqueRoutes = require('./routes/boutique');
const tarifsRoutes = require('./routes/tarifs');
const commandesRoutes = require('./routes/commandes');
const stockRoutes = require('./routes/stock');
const disponibilitesRoutes = require('./routes/disponibilites');
const livraisonsRoutes = require('./routes/livraisons');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

connectDB();

app.use(cors({
  origin: process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(',') : '*',
}));
app.use(express.json());

// Attache io à chaque requête pour que les contrôleurs puissent émettre des événements
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/auth', authRoutes);
app.use('/boutique', boutiqueRoutes);
app.use('/tarifs', tarifsRoutes);
app.use('/commandes', commandesRoutes);
app.use('/stock', stockRoutes);
app.use('/disponibilites', disponibilitesRoutes);
app.use('/livraisons', livraisonsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Gestion d'erreurs globale
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});

initSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
