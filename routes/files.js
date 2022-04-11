require('dotenv').config()

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Redis = require('redis');

const redisClient = Redis.createClient(
    process.env.REDIS_URL,
);
redisClient.auth(process.env.REDIS_PASSWORD);

let upload = setupMulter()

// File upload Endpoint-> '/files' [POST]
router.post('/', (req, res) => { uploadFile(req, res, upload); });

// File download Endpoint-> '/files/:publicKey' [GET]
router.get('/:uuid', (req, res) => { 
    const ipAddr = '0.0.0.0';
    chkDailyUsgLimitExceed(ipAddr, 'dload', req, res);
    
    // downloadFile(req, res);
 }); 

// File removal Endpoint-> '/files/:privateKey' [DELETE]
router.delete('/:pvtKey', (req, res) => { deleteFile(req, res); });

function setupMulter() {
    // Multer configuration for handling incoming 'multipart/form-data i.e. file upload
    let storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
            console.log(uniqueName);
        },
    });

    let upload = multer({
        storage: storage, limit: { filesize: 1000000 * 100 }
    }).single('myfile'); //100mb

    return upload;
}

function uploadFile(req, res, upload) {
    //Store file
    upload(req, res, async (err) => {

        if (err) {
            return res.status(500).send({ error: err.message });
        }

        //Validate request
        if (!req.file) {
            return res.json({ error: 'All fields are required.' });
        }

        //Store into database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            pvtKey: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();

        return res.json({
            status: 'File upload success.',
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
            publicKey: response.uuid,
            privateKey: response.pvtKey
        });
    });
}

async function downloadFile (req, res) {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        //Link expired i.e. file no longer available
        if (!file) {
            return res.json({ error: 'Link has been expired.' });
        }

        const filePath = `${__dirname}/../${file.path}`;
        res.download(filePath);
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
}

async function deleteFile(req, res) {
    try {
        const file = await File.findOne({ pvtKey: req.params.pvtKey });
        //Link expired i.e. file no longer available
        if (!file) {
            return res.json({ error: 'Link has been expired.' });
        }

        fs.unlinkSync(file.path);
        await file.remove();
        return res.json({
            status: 'File successfully removed.',
        });
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
}

function chkDailyUsgLimitExceed(ipAddr, trnsctnType, req, res){
    
    let DAILY_LIMIT = 0;
    if(trnsctnType == 'dload'){
        DAILY_LIMIT = process.env.DAILY_DOWNLOAD_LIMIT
    }
    if(trnsctnType == 'upload'){
        DAILY_LIMIT = process.env.DAILY_UPLOAD_LIMIT
    }

    redisKey = `${ipAddr}_${trnsctnType}_count`;

    redisClient.get(redisKey, async(error, trnsctnCount)=>{
        
        if(error){console.log(error); return;}
        
        //Key exists in Redis
        if(trnsctnCount!=null){
            const intTrnsctnCount = parseInt(trnsctnCount);
            console.log(`Cache hit - ${ipAddr}_trnsctn_count: ${intTrnsctnCount}`);
            //Daily limit reached
            if(intTrnsctnCount==DAILY_LIMIT){ return res.json({error: "Daily limit reached."});}
            //Daily limit still not reached
            else{
                redisClient.set(redisKey, intTrnsctnCount+1, 'KEEPTTL');
                return res.json({TRANSACTION_COUNT_TODAY: intTrnsctnCount+1});
            }
        }
       
        // First time - save Key into Redis 
        else{
            console.log(`Cache miss - Initial entry`);
            redisClient.setex(
                redisKey,
                process.env.REDIS_DEFAULT_EXPIRATION_TIME,
                1
            );
            res.json({TRANSACTION_COUNT_TODAY: 1});
        }
    });

}

function getOrSetCache(key, cb){
    return new Promise((resolve, reject)=>{
        redisClient.get(key, async (error, data)=>{
            if(error){
                return reject(error);
            }
            if(data!=null){
                // return resolve(JSON.parse(data));
                // redisClient.set
            }

            const freshData = await cb();
            redisClient.setEx(key, process.env.REDIS_DEFAULT_EXPIRATION_TIME, freshData);
            resolve(freshData);
        });
    });
}

module.exports = router;