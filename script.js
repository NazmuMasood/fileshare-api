require('dotenv').config()

const connectDB = require('./config/db');
const File = require('./models/file');
const fs = require('fs');

// Get all records older than $inactivePeriod
async function deleteData() {
    var inactivPeriod = process.env.PERIOD_OF_INACTIVITY_IN_MILISECOND;
    const files = await File.find({ createdAt : { $lt: new Date(Date.now() - inactivPeriod)} })
    if(files.length) {
        for (const file of files) {
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`successfully deleted ${file.filename}`);
            } catch(err) {
                console.log(`error while deleting file ${err} `);
            }
        }
    }
    console.log('Job done!');
}

module.exports = connectDB().then(()=>{
    deleteData();   
    // .then(process.exit); 
});