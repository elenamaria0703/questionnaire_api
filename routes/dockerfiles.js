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
    fs.readFile(`./static/${userId}/Dockerfile`, 'utf8',(err, data) => {
        if (err) throw err;
        console.log(data);
      });
    res.send(true);
    console.log("yes");
});

// router.post('/download', async(req,res)=>{
//     await res.download('./tmp/Dockerfile', 'Dockerfile')
//     setTimeout(function () {
//         fs.truncate('./tmp/Dockerfile', 0, function(){console.log('done')})
//     }, 5000);
    
// });

module.exports=router;