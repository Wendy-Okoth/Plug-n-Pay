import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Import routes
import developerRoutes from './routes/developer';
import subscriptionRoutes from './routes/subscription';
import paymentRoutes from './routes/payment';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection().then(success => {
  if (!success) {
    console.log('⚠️  Starting in demo mode (no database)');
  }
});

// Routes
app.use('/api/developers', developerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Plug-n-Pay API',
    environment: process.env.NODE_ENV
  });
});

// Basic error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Plug-n-Pay API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN}`);
  console.log(`🗂️  Available routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/developers/register`);
  console.log(`   - GET  /api/developers/profile`);
  console.log(`   - POST /api/subscriptions/plans`);
  console.log(`   - GET  /api/subscriptions/plans`);
  console.log(`   - POST /api/payments/check-access`);
  console.log(`   - POST /api/payments/verify`);
});