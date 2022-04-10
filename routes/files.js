require('dotenv').config()

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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


// File upload Endpoint-> '/files' [POST]
router.post('/', (req, res) => {

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
});


// File download Endpoint-> '/files/:publicKey' [GET]
router.get('/:uuid', async (req, res) => {
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
});


// File removal Endpoint-> '/files/:privateKey' [DELETE]
router.delete('/:pvtKey', async (req, res) => {
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
});

module.exports = router;