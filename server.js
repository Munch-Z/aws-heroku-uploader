require('dotenv').config()

const fs = require('fs');
const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
const PORT = process.env.PORT || 8080;

const app = express();

app.set('views', './views');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(PORT, (err) => {
    console.log(`App listening on PORT: ${PORT}`);
});

const USERID = 'Zach';

AWS.config.region = 'us-west-2';

const S3_BUCKET = process.env.S3_BUCKET;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


const writeDir = path.join(__dirname, 'userConfig');

app.get('/account', (req, res) => {


    res.sendFile(path.join(__dirname, './views/accounts.html'));

    s3.listBuckets(function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Buckets);
        }
    });


    s3.getObject({Bucket: S3_BUCKET, Key: USERID + '/test.json'}, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("This is the content of the file that you are requesting: ", JSON.parse(data.Body));
        }
    });


});

app.post('/create', (req, res) => {

    const params = {
        Bucket: S3_BUCKET,
        Key: USERID + '/test.json',
        Body: JSON.stringify(req.body)
    };

    s3.upload(params, (s3Err, data) => {
        if (s3Err) throw s3Err
        console.log(`File uploaded successfully at ${data.Location}`)
        res.json(req.body);
    })

})