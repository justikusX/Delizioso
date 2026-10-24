import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { createDatabase, initDatabase } from './db.js';
import { loadUser } from './middleware/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import reservationRoutes from './routes/reservations.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client', 'dist');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', loadUser);
app.use('/api', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Not found' });
});

if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
});

async function start() {
    await createDatabase();
    await initDatabase();
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
}

start().catch((error) => {
    console.error('Could not start the server:', error.message);
    process.exit(1);
});
