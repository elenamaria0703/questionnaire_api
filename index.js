const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
var pathfinderUI = require('pathfinder-ui');
const http = require('http');
const WebSocket = require('ws');
const router = express.Router();
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

const server = http.createServer(app);

//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.send('You are connected!')
});


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('static'))

router.post('/:id/:project/:service/payload', async(req,res)=>{
  const id = req.params.id;
  const project = req.params.project;
  const service = req.params.service;
  
  const path = `static/${id}/projects/${project}/${service}`;
  const link = req.body.repository.clone_url;
  const name = req.body.repository.name;
  console.log(link);
  console.log(name);
  if(req.body.zen)
    console.log("just set up",req.body.zen);
  else{
    let service_db = await db.collection("projects").findOne({"user": id, "name": project, "services.service_name": service});
  
    let image = service_db.services.find(serv=> serv.service_name == service).image_name
    console.log(image);
    wss.clients
      .forEach(client => {
        client.send(`${id}:${project}:${service}:${image}:${name}`);   
      });

    exec(`cd ${path} && rm -r ${name} && git clone ${link}`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
      }
      console.log("executed")
      console.log(`stdout: ${stdout}`);
    });
  }
  //the client will request new service built
})

app.use('/',router);
app.use('/pathfinder', function(req, res, next){
    pathfinderUI(app);
    next();
  }, pathfinderUI.router);
  

const databasesRoute = require('./routes/databeses');
app.use('/databases', databasesRoute);

const apisRoute = require('./routes/apis');
app.use('/apis', apisRoute);

const webRoute = require('./routes/web');
app.use('/web', webRoute);

const dockerfilesRoute = require('./routes/dockerfiles');
app.use('/dockerfiles', dockerfilesRoute);

const dockerRoute = require('./routes/docker');
app.use('/docker', dockerRoute);

const projectsRoute = require('./routes/projects');
app.use('/projects', projectsRoute);

const repositoryRoute = require('./routes/repository');
app.use('/repository', repositoryRoute);

server.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
