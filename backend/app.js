const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clientUrls, nodeEnv } = require('./src/config/env');
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const errorHandler = require('./src/middleware/errorMiddleware');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (clientUrls.includes(origin)) {
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

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

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

app.use(errorHandler);

module.exports = app;
