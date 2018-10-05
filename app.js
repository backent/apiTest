var port = process.env.PORT || 3000;
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';
const pass = encodeURI("!T7bes5s123");

const uri = 'mongodb://malik:t7bes5s123@cluster0-shard-00-00-jgwal.gcp.mongodb.net:27017,cluster0-shard-00-01-jgwal.gcp.mongodb.net:27017,cluster0-shard-00-02-jgwal.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';

// Database Name
const dbName = 'myproject';

// Create a new MongoClient
const client = new MongoClient(uri,{ useNewUrlParser: true });
client.connect((err, client)=>{
  
    
    assert.equal(null, err);
  console.log("Connected correctly to server");
});



var app =express();

app.use(express.json());

app.get('/',(req,res)=>{
	res.send("helow");
});

app.post('/user',(req,res)=>{
	var dataPayload = {
		nama : req.body.nama,
		umur : req.body.umur
	};

	

  const db = client.db(dbName);

  // Insert a single document
  db.collection('users').insertOne(dataPayload, function(err, r) {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);

 
  
  });

	console.log(dataPayload);
	res.end();
});

app.get('/user',(req,res)=>{

  const db = client.db(dbName);

  const col = db.collection('users');

    col.find({nama : req.query.nama}).next(function(err, doc) {
     assert.equal(null, err);

     console.log(doc);
     console.log(typeof(doc));
     var stringObj = JSON.stringify(doc);
     res.status(200).send(stringObj);

    });
});	

app.listen(port,()=>{
	console.log("listening");
});