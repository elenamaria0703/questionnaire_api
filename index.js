const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('static'))

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

app.listen(3000);