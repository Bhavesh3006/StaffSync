import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'StaffSync HRMS API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[StaffSync Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;

