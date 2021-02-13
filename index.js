const express= require('express');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
const databasesRoute = require('./routes/databeses');
app.use('/databases', databasesRoute);



app.listen(3000);