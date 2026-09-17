import dotenv from 'dotenv';
dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: '../.env' });
}
import express   from 'express';
import cors      from 'cors';
import morgan    from 'morgan';
import mongoose  from 'mongoose';

// ── Routes ────────────────────────────────────────────────────
import authRoutes            from './routes/authRoutes.js';
import donationRoutes        from './routes/donationRoutes.js';
import matchRoutes           from './routes/matchRoutes.js';
import messageRoutes         from './routes/messageRoutes.js';
import requirementRoutes     from './routes/requirementRoutes.js';
import ngoMatchActionsRoutes from './routes/ngoMatchActionsRoutes.js';
import adminRoutes           from './routes/adminRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/donations',         donationRoutes);
app.use('/api/matches',           matchRoutes);
app.use('/api/messages',          messageRoutes);
app.use('/api/requirements',      requirementRoutes);
app.use('/api/ngo/match-actions', ngoMatchActionsRoutes);
app.use('/api/admin',             adminRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Database + Start ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
