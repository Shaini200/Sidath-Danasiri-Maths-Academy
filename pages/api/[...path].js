const express = require('express');
const path = require('path');
const fs = require('fs');
const authRoutes = require('../../server/routes/authRoutes');
const studentRoutes = require('../../server/routes/studentRoutes');
const paymentRoutes = require('../../server/routes/paymentRoutes');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use((req, res, next) => {
  if (!req.url.startsWith('/api/')) {
    req.url = `/api${req.url}`;
  }
  next();
});
app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

module.exports = app;

module.exports.config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
