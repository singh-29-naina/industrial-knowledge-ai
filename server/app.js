import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import documentRoutes from './routes/document.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js'; // NEW
import systemMapRoutes from './routes/systemMap.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes); // NEW
app.use('/api/system-map', systemMapRoutes);
app.use('/api/settings', settingsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Industrial Knowledge Intelligence Backend Running" });
});

export default app;