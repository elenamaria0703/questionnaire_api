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
router.post('/:id/create', async(req,res)=>{
  const type = req.body.type;
  const name = req.body.name;
  const user = req.params.id;
  
  var dir = `./static/${user}/projects/${name}`;
  var project;
  if(type == "MULTIPLE_SERVICE")
    project = { user: user, project_name: name, services: [] ,type};
  else
    project = { user: user, project_name: name, type}

  db.collection("projects").insertOne(project, function(err, res) {
      if (err) throw err;
      createUserDirectory(user,name);
      if(type == "MULTIPLE_SERVICE")
        fs.writeFile(`${dir}/docker-compose.yml`,'',(err) => {
          if (err) throw err; 
        });
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

module.exports=router;