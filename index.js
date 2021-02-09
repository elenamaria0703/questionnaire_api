const express= require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

app.use(cors());
app.use(bodyParser.json());
const databasesRoute = require('./routes/databeses');
app.use('/databases', databasesRoute);

mongoose.connect(process.env.DB_CONNECT_STRING
    ,{ useNewUrlParser: true , useUnifiedTopology: true}, () =>
    console.log("connected db")
);


app.listen(3000);