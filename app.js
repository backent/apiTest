var port = process.env.PORT || 3000;
const express = require('express');
var _data = require('./lib/data.js');
var helpers = require('./lib/helpers.js');
var path = require('path');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var app =express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));


 
app.get('/',(req,res)=>{

	res.sendFile(path.join(__dirname,'./views/index.html'));
});

 

app.get('/login',(req,res)=>{
	let token = req.cookies.token;
	if(token && token.expires > Date.now()){
		res.redirect('/');
			
	}
	else
	res.sendFile(path.join(__dirname,'./views/login.html'));
});


app.get('/signup',(req,res)=>{
	let token = req.cookies.token;
	if(token && token.expires > Date.now()){
		res.redirect('/');
			
	}
	else
	res.sendFile(path.join(__dirname,'./views/signup.html'));
});

app.get('/logout',(req,res)=>{

		let token = req.cookies.token;
	   if(token && token.expires > Date.now()){
		
			_data.delete("tokens",{tokenId : token.tokenId},function(err){
			if(!err){
				res.clearCookie('token');
				res.status(200).end();
			}
			else
				res.status(404).send("didn't find the specified token");
		});
			
		}
		else
			res.status(403).send("invalid token");



	
	
});



/*
	user's api
*/

/*
	require: username,password, phoneNumber
*/
app.post('/api/user',(req,res)=>{
	let phone = typeof(req.body.phone) == 'string' && req.body.phone.trim().length > 0 ? req.body.phone : false;
	let username = typeof(req.body.username) == 'string' && req.body.username.trim().length > 0 ? req.body.username : false;
	let password = typeof(req.body.password) == 'string' && req.body.password.trim().length > 0 ? req.body.password : false;
	console.log(req);
	console.log(phone);
	console.log(username);
	console.log(password);

	if(phone && username && password){
		
		var dataPayload = {
			username : req.body.username,
			phone : req.body.phone,
			password : req.body.password,
			
		};
		_data.read('users',{"username" : username}, function(err,data){
		 	if(err){
		 		
				_data.create('users',dataPayload,function(err){
					if(!err){
						console.log("success",dataPayload);
						res.send("success");
					}
					else{
						console.log(err);
						res.status(404).send("missing require field");
					}
				});
		 	}
		 	else
		 		res.status(500).send("already have user with that username");
		 });;

	}
	else
		return res.status(400).send("missing require field");





});

/*
	require:username
*/
app.get('/api/user',(req,res)=>{
	let username = typeof(req.query.username) == 'string' && req.query.username.trim().length > 0 ? req.query.username : false;
	let token = req.headers.token;
	
	if(username){
		_data.read("tokens",{tokenId : token}, function(err,tokenData){
			if(tokenData && tokenData.expires > Date.now() && tokenData.username == username){
			 _data.read('users',{"username" : username}, function(err,data){
			 	if(!err && data){
			 		console.log(data);
			 		res.send(JSON.stringify(data));
			 	}
			 	else
			 		res.status(500).send("error while reading the specified data or data is not found");
			 });;
					
			}
			else
				res.status(403).send("invalid token");
	});

	}
	else
		return res.status(400).send("missing require data to find");

   
});	

/*
	require : username
	optional : phone, password
*/

app.put('/api/user',(req,res)=>{
	let phone = typeof(req.body.phone) == 'string' && req.body.phone.trim().length > 0 ? req.body.phone : false;
	let username = typeof(req.body.username) == 'string' && req.body.username.trim().length > 0 ? req.body.username : false;
	let password = typeof(req.body.password) == 'string' && req.body.password.trim().length > 0 ? req.body.password : false;
	let token = req.headers.token;
	if(username){
		
		_data.read("tokens",{tokenId : token}, function(err,tokenData){
		if(tokenData && tokenData.expires > Date.now()  && tokenData.username == username){
		
				
			let dataPayload = {};
			if(phone){
				dataPayload.phone= phone;
			}
			if(password){
				dataPayload.username = username;
			}

			_data.update('users',{"username": username}, dataPayload, function(err,data){
				if(!err){
					res.status(200).send("updating success");
				}
				else{
					console.log(err);
					res.status(500).end(err);
				}
			});
		
		}
		else
			res.status(403).send("invalid token");
	});
	}
	else
		return res.status(400).send("missing require data to find");
});	

/*
	require: username
*/
app.delete('/api/user',(req,res)=>{
	let username = typeof(req.query.username) == 'string' && req.query.username.trim().length > 0 ? req.query.username : false;
	if(username){
		let token = req.headers.token;
		_data.read("tokens",{tokenId : token}, function(err,tokenData){

		
	   if(tokenData && tokenData.expires > Date.now() && tokenData.username == username){
		
			_data.delete('users',{"username":username}, function(err){
				if(!err){
					res.status(200).send("deleting success");
				}
				else{
					console.log(err);
					res.status(500).end();
				}
			});
			
		}
		else
			res.status(403).send("invalid token");
		});

	}
	else
		return res.status(400).send("missing require data to find");

});	

/*
	token's api
*/
app.post('/api/token',(req,res)=>{
	let username = typeof(req.body.username) == 'string' && req.body.username.trim().length > 0 ? req.body.username : false;
	let password = typeof(req.body.password) == 'string' && req.body.password.trim().length > 0 ? req.body.password : false;

	if(username && password){
		 _data.read('users',{"username" : username}, function(err,userData){
		 	if(!err && userData){
		 		if(userData.password == password){
		 			let tokenId = helpers.createRandomString(20);
					let expires = Date.now() + 1000 * 60 * 60;
				/*	let expires = Date.now() + 12000;*/
					let dataObject = {
						'username' : userData.username,
						'tokenId' : tokenId,
						'expires' : expires
					}
		 			_data.create('tokens', dataObject, function(err){
		 				if(!err){
		 					/*localStorage.setItem('token',tokenId);*/
		 					console.log(expires);
		 					res.cookie("token", dataObject);
		 					res.status(200).end(JSON.stringify(dataObject));
		 				
		 				}
		 				else
		 					res.status(500).send("error while creating token");
		 			});
		 		}
		 		else
		 			res.status(500).send("password didn't match");
		 	}
		 	else
		 		res.status(500).send("error while reading the specified data or data is not found");
		 });;

	}
	else
		return res.status(400).send("missing require field(s)");
});

app.get('/api/token',(req,res)=>{
	let token = typeof(req.query.token) == 'string' && req.query.token.trim().length == 20 ? req.query.token : '';	

	if(token){
		_data.read("tokens",{tokenId : token},function(err,tokenData){
			if(!err && tokenData){
				res.status(200).end();
				console.log(tokenData);
			}
			else
				res.status(404).send("can't find the specified token");
		});
	}
	else
		res.status(400).send("missing require field");
});

app.put('/api/token',(req,res)=>{
	let token = typeof(req.body.token) == 'string' && req.body.token.trim().length == 20 ? req.body.token : '';	
	let extend = typeof(req.body.extend) == 'boolean' && req.body.extend == true ? true : false;
	
	if(token && extend){
		_data.read("tokens",{tokenId : token}, function(err,tokenData){
			if(!err && tokenData){
				if(tokenData.expires > Date.now()){
					tokenData.expires = Date.now() * 1000 * 60 * 60;
					_data.update("tokens",{tokenId : token},tokenData, function(err){
						if(!err){
							res.status(200).end();
						}
						else
							res.status(500).send("couldn't extend the token");
					});

				}
				else
					res.status(500).send("token already expire");
			}
			else
				res.status(404).send("didn't find the specified token");
		});
	}
	else
		res.status(400).send("missing require field(s)");
});

app.delete('/api/token', (req,res)=>{

	let token = typeof(req.query.token) == 'string' && req.query.token.trim().length == 20 ? req.query.token : '';	

	if(token){
		_data.delete("tokens",{tokenId : token},function(err){
			if(!err){
				res.status(200).end();
			}
			else
				res.status(404).send("didn't find the specified token");
		});
	}
	else
		res.status(400).send("missing require field");

});



app.get('/ping', (req,res)=>{
	res.status(200).end();
});

app.listen(port,()=>{
	console.log("listening");
});