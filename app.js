var express = require('express');
var port = process.env.PORT || 3000;


var app = express();

app.get('/',(req,res)=>{
	res.send("helo");
});

app.listen(port,()=>{
	console.log("listening");
});