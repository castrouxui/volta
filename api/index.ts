import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import generateRouter from './routes/generate';
import authRouter from './routes/auth';
import billingRouter from './routes/billing';
import exportRouter from './routes/export';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS
app.use(
  cors({
    origin: [FRONTEND_URL, 'https://volta-tawny.vercel.app', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  })
);

// Webhook needs raw body — must be before express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
