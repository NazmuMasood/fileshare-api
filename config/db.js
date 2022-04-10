require('dotenv').config();

const mongoose = require('mongoose');

// DB connection
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_CONNECTION_URL,);
      console.log('MongoDB Connected...')
    }
    catch(err) {
      console.log(err.message);
      process.exit(1);
    }
}
 
module.exports = connectDB;