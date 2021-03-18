const express= require('express');
const router = express.Router();
const fs = require('fs') 


router.post('/upload', async(req,res)=>{
    const commands = req.body.commands.join("\n");
    const userId = req.body.userId;
    var dir = `./static/${userId}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.writeFile(`./static/${userId}/Dockerfile`, commands, (err) => { 
        if (err) throw err; 
    })  
    res.send(true);
});

router.post('/get-user-file', async(req,res)=>{
    const userId = req.body.userId;
    fs.readFile(`./static/${userId}/Dockerfile`, 'utf8',(err, data) => {
        if (err) {
            res.sendStatus(404);
        };
        console.log(data);
        res.send(data);
    });
    
})

router.post('/empty-user-file', async(req,res)=>{
    const userId = req.body.userId;
    
    setTimeout(()=>fs.truncate(`./static/${userId}/Dockerfile`, 0, function(){
        console.log("empty file");
        res.sendStatus(200);
    }), 5000);
});

module.exports=router;