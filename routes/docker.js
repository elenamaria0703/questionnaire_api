const express= require('express');
const router = express.Router();
const fs = require('fs') 
const { exec } = require("child_process");
var Docker = require('dockerode');
var docker = new Docker();


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

module.exports=router;

// const auth = {
//     username: "myonboard",
//     password: "Cacanploaie0703",
//     auth: '',
//     email: 'lotuselena1@yahoo.com',
//     serveraddress: 'https://index.docker.io/v1'
//   };
// var auth = { key: 'bXlvbmJvYXJkOkNhY2FucGxvYWllMDcwMw==' }

// const image = docker.getImage("myonboard/test");
    // image.tag({
    // authconfig: auth,
    // repo: "myonboard/test",
    // }, (err, data) => {
    // console.log(err, data);
    //     image.push({
    //         tag: "latest",
    //     }, (error, response) => {
    //         response.pipe(process.stdout);
    //         console.log(err);
    //     });
    // });

    // var link = "https://github.com/ThomasG77/angular-openlayers-minimal-project.git"
    // exec(`cd test && git clone ${link}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log("executed")
    //     console.log(`stdout: ${stdout}`);
    // });