const express= require('express');
const router = express.Router();
const fs = require('fs') 
const { exec } = require("child_process");
var Docker = require('dockerode');
var docker = new Docker();
const MongoClient = require('mongodb').MongoClient;

require('dotenv/config');

const uri = process.env.DB_CONNECT_STRING;
let client;
let db;
async function connectDatabase(){
    client = await MongoClient.connect(uri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    });
    db = client.db('licenta');
}
connectDatabase();


router.post('/:id/image', async(req,res)=>{
    var user = req.params.id;
    var image = req.body.image;
    var project = req.body.name;
    var source = req.body.source;
    await docker.buildImage({
        context: `static/${user}/projects/${project}`,
        src: [ 'Dockerfile',source]
    }, {t: `myonboard/${image}`}, function (err, stream) { 
        docker.modem.followProgress(stream, onFinished, onProgress)
            function onFinished(err, output) {
                if (err) {
                    throw err;
                }
                console.log("started push");
                exec(`docker push myonboard/${image}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });

            }
            function onProgress(event) {
                console.log("building")
            }
    });  
})

router.post('/:id/service-image', async(req,res)=>{
    var user = req.params.id;
    var image = req.body.image;
    var project = req.body.name;
    var source = req.body.source;
    var service = req.body.service;
    await docker.buildImage({
        context: `static/${user}/projects/${project}/${service}`,
        src: [ 'Dockerfile',source]
    }, {t: image}, function (err, stream) { 
        docker.modem.followProgress(stream, onFinished, onProgress)
            function onFinished(err, output) {
                if (err) {
                    throw err;
                }
                console.log("started push");
                exec(`docker push ${image}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    res.send("Done").status(200);
                });

            }
            function onProgress(event) {
                console.log("building")
            }
    }); 
    db.collection("projects").findOneAndUpdate(
        {"user": user, "project_name": project, "services.service_name": service},
        { "$set": { "services.$.status" : "BUILT" }},
        function(err,doc) {
          console.log("status updates")
        }
     ); 
})

module.exports=router;