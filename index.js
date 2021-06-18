const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
var pathfinderUI = require('pathfinder-ui');
const http = require('http');
const WebSocket = require('ws');


const server = http.createServer(app);

//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.send('You are connected!')
});


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('static'))

// app.post('/:id/:project/payload', async(req,res)=>{
//   const id = req.params.id;
//   const project = req.params.project;
  
//   const path = `static/${id}/projects/${project}`;
//   const link = req.body.repository.clone_url;
//   const name = req.body.repository.name;
//   console.log(link);
//   console.log(name);

//   exec(`cd ${path} && rm -r ${name} && git clone ${link}`, (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//     }
//     console.log("executed")
//     console.log(`stdout: ${stdout}`);
//   });
  
//   wss.clients
//       .forEach(client => {
//         client.send([id,project]);   
//       });
// })


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

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
