import express from 'express';
import sqlite3 from 'sqlite3';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Error al abrir DB:', err.message);
    else console.log('📦 Base de datos conectada');
});

db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca TEXT NOT NULL,
    email TEXT NOT NULL,
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.get('/api/stats', async (req, res) => {
    try {
        const statsData = {
            instagram: { vistas: 9091004, seguidores: 0 },
            youtube: { vistas: 3954610, suscriptores: 40511 },
            tiktok: { vistas: 1800000, meGusta: 84000 },
            facebook: { vistas: 1720937 },
            total: 16546551
        };
        res.json(statsData);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

app.post('/api/contact', async (req, res) => {
    const { marca, email, mensaje } = req.body;
    if (!marca || !email || !mensaje) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    db.run(`INSERT INTO leads (marca, email, mensaje) VALUES (?, ?, ?)`,
        [marca, email, mensaje], function(err) {
        if (err) {
            console.error('Error al guardar lead:', err);
            return res.status(500).json({ error: 'Error al guardar' });
        }
        console.log(`✅ Nuevo lead: ${marca} (${email})`);
    });

    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_DESTINO,
            subject: `🚀 Nueva propuesta: ${marca}`,
            html: `<h2>Nueva solicitud</h2><p><b>Marca:</b> ${marca}</p><p><b>Email:</b> ${email}</p><p><b>Mensaje:</b> ${mensaje}</p>`
        });
        console.log(`📧 Correo enviado: ${marca}`);
    } catch (error) {
        console.error('Error correo:', error.message);
    }

    res.json({ success: true, mensaje: 'Propuesta recibida' });
});

app.get('/api/leads', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY fecha DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`🔥 Fameo Studio en http://localhost:${PORT}`);
});