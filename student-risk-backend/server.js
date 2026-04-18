require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const helmet = require('helmet');

const cors = require('cors');

const morgan = require('morgan');

const compression = require('compression');

const app = express();

// Middleware

app.use(helmet());

app.use(cors());

app.use(morgan('combined'));

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes

app.use('/api/students', require('./src/routes/studentRoutes'));

app.use('/api/risks', require('./src/routes/riskRoutes'));

app.use('/api/academic', require('./src/routes/academicRoutes'));

app.use('/api/finance', require('./src/routes/financeRoutes'));

app.use('/api/upload', require('./src/routes/uploadRoutes'));

app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));

app.use('/api/alerts', require('./src/routes/alertRoutes'));

// Error handling middleware

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).send('Something broke!');

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});

app.get("/", (req, res) => {
  res.send("Backend Working");
});