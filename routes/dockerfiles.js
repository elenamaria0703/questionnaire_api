const express= require('express');
const router = express.Router();
const fs = require('fs') 
const yaml = require('js-yaml')


router.post('/upload', async(req,res)=>{
    const commands = req.body.commands.join("\n");
    const userId = req.body.userId;
    var dir = `./static/${userId}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.writeFile(`./static/${userId}/Dockerfile`, commands, (err) => { 
        if (err) throw err; 
    })  
    res.send(true);
});

router.post('/:name/upload-build-ss', async(req,res)=>{
    const commands = req.body.commands.join("\n");
    const userId = req.body.userId;
    const proj = req.params.name;
    var dir = `./static/${userId}/projects/${proj}`;

    fs.writeFile(`${dir}/Dockerfile`, commands, (err) => { 
        if (err) throw err; 
    })  
    res.send(true);
});


router.post('/:project/:service/upload-build-ms', async(req,res)=>{
    const commands = req.body.commands.join("\n");
    const userId = req.body.userId;
    const proj = req.params.project;
    const serv = req.params.service;
    var dir = `./static/${userId}/projects/${proj}/${serv}`;

    fs.writeFile(`${dir}/Dockerfile`, commands, (err) => { 
        if (err) throw err; 
    })  
    res.send(true);
});


router.post('/upload-services', async(req,res)=>{
    const commands = req.body.commands
    const userId = req.body.userId;
    var dir = `./static/${userId}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const name = commands[0].name;
    let params = {}
    for(i=0;i<commands[0].commands_array.length;i++){
        const element = commands[0].commands_array[i];
        if(element.name == "image")
            Object.assign(params, {image: element.value[0]});
        else
            Object.assign(params, {[element.name]: element.value});
    }
    console.log(params)
    let data={
        [name]: params
    };
    let data_to_send={
        version: '3',
        services: data
    }

    let yamlStr = yaml.dump(data_to_send);
    fs.writeFileSync(`./static/${userId}/docker-compose.yml`, yamlStr, 'utf8');  
    
    res.send(true);
});

router.post('/get-user-file', async(req,res)=>{
    const userId = req.body.userId;
    fs.readFile(`./static/${userId}/Dockerfile`, 'utf8',(err, data) => {
        if (err) {
            res.sendStatus(404);
        };
        console.log(data);
        res.send(data);
    });
    
})

router.post('/empty-user-file', async(req,res)=>{
    const userId = req.body.userId;
    
    setTimeout(()=>fs.truncate(`./static/${userId}/Dockerfile`, 0, function(){
        console.log("empty file");
        res.sendStatus(200);
    }), 5000);
});

router.post('/upload-build-services', async(req,res)=>{
    const commands = req.body.commands
    const userId = req.body.userId;
    const project = req.body.projectName;
    var dir = `./static/${userId}/projects/${project}`;
    
    let data={};
    commands.forEach((service)=>{
        const name = service.name;
        let params = {};
        for(i=0;i<service.commands_array.length;i++){
            const element = service.commands_array[i];
            if(element.name == "image" || element.name == "restart")
                Object.assign(params, {[element.name]: element.value[0]});
            else if(element.name == "environment"){
                let env = {};
                element.value.forEach(v=>{
                    const key = v.split(':')[0];
                    const value = v.split(':')[1];
                    Object.assign(env, {[key]: value});
                })
                Object.assign(params, {[element.name]: env});
            }
            else 
                Object.assign(params, {[element.name]: element.value});
        }
        Object.assign(data, {[name]: params});
    })
    
    let data_to_send={
        version: '3',
        services: data
    }

    let yamlStr = yaml.dump(data_to_send);
    fs.writeFileSync(`${dir}/docker-compose.yml`, yamlStr, 'utf8');  
    
    res.send(true);
});

module.exports=router;