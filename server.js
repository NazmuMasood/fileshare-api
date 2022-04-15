require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', true);

// Database configuration
const connectDB = require('./config/db');
connectDB();

// Routes
app.get('/', (req, res)=>{ res.send("Welcome to FileShare Api!");});
app.use('/files', require('./routes/files'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));