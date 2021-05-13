const express= require('express');
const router = express.Router();
const fs = require('fs') 
const MongoClient = require('mongodb').MongoClient;

require('dotenv/config');

const uri = process.env.DB_CONNECT_STRING;
let client;
async function connectDatabase(){
    client = await MongoClient.connect(uri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    });
}

connectDatabase();

router.post('/:id', async(req,res) =>{
    const id= req.params.id
    const parent = req.body.parent
    const userValue= req.body.userValue
    const db = client.db('licenta');
    let item = await db.collection('databases').findOne({_id: id});
    if(item == null && parent !== ''){
        item = await db.collection('databases').findOne({_id: `${parent}_${id}`});
    }
    if(item && item.command && userValue){
        item.command = item.command.replace(/user_value/g,userValue)
    }
    if(item && item.dc_command && userValue){
        item.dc_command[1] = item.dc_command[1].replace('user_value',userValue)
    }
    res.send(item)
});



module.exports = router;



