const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('static'))

const databasesRoute = require('./routes/databeses');
app.use('/databases', databasesRoute);

const dockerfilesRoute = require('./routes/dockerfiles');
app.use('/dockerfiles', dockerfilesRoute);

app.listen(3000);