require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const cors = require('cors');

// Cors 
const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(',')
  // ['http://localhost:3000', 'http://localhost:5000']
}
app.use(cors(corsOptions))

// Database configuration
const connectDB = require('./config/db');
connectDB();

// Scheduler to cleanup files
const schedule = require('node-schedule');
const job = schedule.scheduleJob('0 0 */24 * * *', function(){ 
    // this job will run every 24 hours
    // change the above 'schedule rule' to '* * * * * *' to run the script right away
    console.log('Running scheduled script..');
    require('./script');
});

app.set('trust proxy', true);

// Routes
app.get('/', (req, res)=>{ res.send("Welcome to FileShare Api!");});
app.use('/files', require('./routes/files'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));