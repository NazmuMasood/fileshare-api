require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

// Database configuration
const connectDB = require('./config/db');
connectDB();

// Routes
app.get('/', (req, res)=>{ res.send("Hellow World");});
app.use('/files', require('./routes/files'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));