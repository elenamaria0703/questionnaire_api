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

router.get('/:id/projects', async(req,res)=>{
    const user = req.params.id;
    db.collection("projects")
        .find({"user": user})
        .toArray()
        .then(docs => res.send(docs).status(200))
})

module.exports=router;