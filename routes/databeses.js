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
        item.command = item.command.replace('user_value',userValue)
    }
    res.send(item)
});

router.patch('/download', async(req,res)=>{
    const commands= req.body.commands.join("\n");
    fs.writeFile('Dockerfile', commands, (err) => { 
      
        // In case of a error throw err. 
        if (err) throw err; 
    }) 
    res.download('./Dockerfile', 'Dockerfile')
    res.end()
});

module.exports = router;



