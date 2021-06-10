const express= require('express');
const router = express.Router();
const fs = require('fs') 
const multiparty = require('multiparty');
const extract = require('extract-zip')
const { exec } = require("child_process");
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

function createUserDirectory(user,name){
  console.log("user", user);
  console.log("name", name);
  var dir = `./static/${user}`;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  dir = `./static/${user}/projects`;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  dir = `./static/${user}/projects/${name}`;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  //return if already exists
}

function createServiceDirectory(user,name,service){
  dir = `./static/${user}/projects/${name}/${service}`;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  fs.writeFile(`${dir}/Dockerfile`,'',(err) => {
    if (err) throw err; 
  }); 
}

router.post('/:id/create', async(req,res)=>{
  const type = req.body.type;
  const name = req.body.name;
  const service = req.body.service;
  const user = req.params.id;
  
  var dir = `./static/${user}/projects/${name}`;
  var project;
  if(type == "MULTIPLE_SERVICE")
    project = { user: user, project_name: name, services: [service] ,type};
  else
    project = { user: user, project_name: name, type}

  db.collection("projects").insertOne(project, function(err, res) {
    if (err) throw err;
    createUserDirectory(user,name);
    if(type == "MULTIPLE_SERVICE"){
      createServiceDirectory(user, name, service.service_name)
      fs.writeFile(`${dir}/docker-compose.yml`,'',(err) => {
        if (err) throw err; 
      });
    }
    else
      fs.writeFile(`${dir}/Dockerfile`,'',(err) => {
        if (err) throw err; 
      });    
  });
  res.send(project);
})

router.post('/:id/:name/upload-single-service-source', async(req,res)=>{
    const user = req.params.id;
    const project_name = req.params.name;
    const form = new multiparty.Form();
    form.parse(req, async(error, fields, files) => {
      if (error) {
        console.log(error.message);
        return res.status(500).send(error);
      };
      try {
        const path = files.source[0].path;
        const name = files.source[0].originalFilename
        const buffer = fs.readFileSync(path);
        if(name.includes('.zip'))
        {
            try {
              await extract(path, { dir: `/Users/elenamaria/licenta/questionnaire_api/static/${user}/projects/${project_name}` })
              console.log('Extraction complete')
            }catch (err) {
              console.log(err);
            }
  
        }else{
          fs.writeFileSync(`./static/${user}/projects/${project_name}/${name}`,buffer)
        }
        return res.status(200).send(name);
      } catch (err) {
        console.log(err.message)
        return res.status(500).send(err);
      }
    });
})

router.post('/:id/:project/:service/upload-multiple-service-source', async(req,res)=>{
  const user = req.params.id;
  const project_name = req.params.project;
  const service_name = req.params.service;
  console.log("service", service_name)
  const form = new multiparty.Form();
  form.parse(req, async(error, fields, files) => {
    if (error) {
      console.log(error.message);
      return res.status(500).send(error);
    };
    try {
      const path = files.source[0].path;
      const name = files.source[0].originalFilename
      const buffer = fs.readFileSync(path);
      if(name.includes('.zip'))
      {
          try {
            await extract(path, { dir: `/Users/elenamaria/licenta/questionnaire_api/static/${user}/projects/${project_name}/${service_name}` })
            console.log('Extraction complete')
          }catch (err) {
            console.log(err);
          }

      }else{
        fs.writeFileSync(`./static/${user}/projects/${project_name}/${service_name}/${name}`,buffer)
      }
      return res.status(200).send(name);
    } catch (err) {
      console.log(err.message)
      return res.status(500).send(err);
    }
  });
})
module.exports=router;