const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const { clientUrls, nodeEnv } = require('./src/config/env');
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const errorHandler = require('./src/middleware/errorMiddleware');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch (error) {
    return value.trim().replace(/\/$/, '');
  }
};

const allowedOrigins = new Set(clientUrls.map((url) => normalizeOrigin(url)).filter(Boolean));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
};

app.use(cors(corsOptions));
app.options(/^(.*)$/, cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  next();
});

if (nodeEnv === 'development') {
  app.use(morgan('tiny'));
}

app.get(['/', '/api', '/api/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ComplaintCare API is running',
    timestamp: new Date().toISOString(),
    environment: nodeEnv,
  });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
