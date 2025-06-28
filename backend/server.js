require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Sequelize instance and models

const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500' 
})); // CORS (allows frontend to talk to backend)
app.use(express.json()); // Parse incoming JSON request bodies

// Basic Test Route
app.get('/', (req, res) => {
  res.send('CampusConnect Backend is running!');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes')); // User auth (login, register, profile)
app.use('/api/events', require('./routes/eventRoutes')); // Event operations

// Sync Database and Start Server
db.sequelize.sync({ alter: true }) // Connects to DB and creates/updates tables based on your models
  .then(() => {
    console.log('Database synced successfully!');
    app.listen(PORT, () => { // Start the Express server
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err); // Errors during DB connection/sync
  });

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(reason.name || 'Error', reason.message || reason, reason.stack || promise);
  process.exit(1);
});