let agenda = require("./lib/agenda");

// require('dotenv').config()

// const Agenda = require('agenda');
// const File = require('./models/file.js');

// const agenda = new Agenda({ db: { address: process.env.MONGO_CONNECTION_URL, collection: 'files' } });

// // Or override the default collection name:
// // const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName'}});

// // or pass additional connection options:
// // const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName', options: {ssl: true}}});

// // or pass in an existing mongodb-native MongoClient instance
// // const agenda = new Agenda({mongo: myMongoClient});

// // function (agenda) {
//     console.log('Agenda: Deleting old files....')
//     agenda.define("delete old files", async (job) => {
//     //   await User.remove({ lastLogIn: { $lt: twoDaysAgo } });
//         var inactivePeriod = 60 * 1000; // 24 hrs = 24 * 60 * 60 * 1000
//         const files = await File.find({ createdAt : { $lt: new Date(Date.now() - inactivePeriod)} })
//             .then(()=>{
//                 console.log(files.length);
//             })
        
//         if(files.length) {
//             for (const file of files) {
//                 try {
//                     fs.unlinkSync(file.path);
//                     await file.remove();
//                     console.log(`successfully deleted ${file.filename}`);
//                 } catch(err) {
//                     console.log(`error while deleting file ${err} `);
//                 }
//             }
//         }
//         console.log('Job done!');
//     });
// // };

// // (async function () {
// //   // IIFE to give access to async/await
// //   await agenda.start();

// //   await agenda.every("24 hours", "delete old users");

// //   // Alternatively, you could also do:
// // //   await agenda.every("*/3 * * * *", "delete old users");
// // })();

// // (async function () {
// //   await agenda.start();
// //   await agenda.every("24 hours", "delete old users");
// // })();

module.exports = agenda;

