let express = require('express');
let app = express();
let AWS = require('aws-sdk');
let requestA = require('request');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let fileUpload = require('express-fileupload');
let port = process.env.PORT || 9001;
let fs = require('fs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
}));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let s3Client;
s3Client = new AWS.S3({
    accessKeyId: "123",
    secretAccessKey: "abc",
    endpoint: new AWS.Endpoint('http://0.0.0.0:4569'),
    sslEnabled: false,
    s3ForcePathStyle: true,
    directory: '/tmp/'
});

app.get('/', function (req, res) {
    const S3 = new AWS.S3({
        s3ForcePathStyle: true,
        endpoint: new AWS.Endpoint('http://0.0.0.0:4569'),
    });
    S3.putObject({
        Bucket: 'delta-velocirender',
        Key: 'abcd',
        Body: new Buffer('abcd')
    }, (response, err) => {
        res.send({"data": JSON.stringify(err)});

    })


});

app.post('/process-files/', function (req, res) {
    let process_json = JSON.parse(req.files.process_file.data.toString());
    let form_json = JSON.parse(req.files.form_file.data.toString());
    s3Client.upload({
        Bucket: 'delta-velocirender',
        Key: "form-prefix/" + form_json.props.id + ".json",
        Body: req.files.form_file.data,
        ACL: 'public-read'
    }, function callback(err, data) {
        console.log(err, data);
        s3Client.upload({
            Bucket: 'delta-velocirender',
            Key: "process-prefix/" + process_json.props.id + ".json",
            Body: req.files.process_file.data,
            ACL: 'public-read'
        }, function uploadCallback(err, data) {
            res.send(JSON.stringify({
                message: "success",
                process_id: process_json.props.id,
                stage_id: process_json.props.initial_stage_id,
                section_id: form_json.sections[0].id,
            }));
        });
    });
});
app.post('/check-files/', function (req, res) {
    function callback(error, response, body) {
        console.log(error)
        res.send(body);
    }

    requestA.post({
        headers: {
            'Content-Type': 'application/json',
            'Request-Origin': 'devtest-asui.local'
        },
        url: 'http://172.18.0.1:5001',
        body: JSON.stringify(req.body)
    }, callback);
});

app.listen(port, function () {
    console.log('Example app listening on port 9001!');
});
