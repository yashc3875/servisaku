import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth.js';
import bookingsRouter from './routes/bookings.js';
import couponsRouter from './routes/coupons.js';
import usersRouter from './routes/users.js';
import reviewsRouter from './routes/reviews.js';
import escrowRouter from './routes/escrow.js';
import refundsRouter from './routes/refunds.js';
import payoutsRouter from './routes/payouts.js';
import chatRouter from './routes/chat.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/escrow', escrowRouter);
app.use('/api/refunds', refundsRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ ServisAku API running on http://localhost:${PORT}`);
});
