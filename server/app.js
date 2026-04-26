require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const { createServer } = require('http');
const buildSocketServer = require('./socket');

const httpServer = createServer(app);
const io = buildSocketServer(httpServer);
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
