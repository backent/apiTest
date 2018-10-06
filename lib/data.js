const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var data = {};

// Connection URL
const url = 'mongodb://localhost:27017';


const uri = 'mongodb://malik:t7bes5s123@cluster0-shard-00-00-jgwal.gcp.mongodb.net:27017,cluster0-shard-00-01-jgwal.gcp.mongodb.net:27017,cluster0-shard-00-02-jgwal.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';

// Database Name
const dbName = 'myproject';
const client = new MongoClient(uri,{ useNewUrlParser: true });


client.connect((err, client)=>{
	  
	    
	    assert.equal(null, err);
	  console.log("Connected correctly to server");
	});




data.read = function(collection, data, callback){

  var db = client.db(dbName);
  const col = db.collection(collection);

   col.find(data).next(function(err, doc) {
   
     if(!err && doc){
     	return callback(false,doc);
     }
     else
     	return callback("error while read data");

    });

};

data.create = function(collection,data,callback){
	  const db = client.db(dbName);
	  const col = db.collection(collection);
  // Insert a single document
  	col.insertOne(data, function(err, r) {

    if(!err && r.insertedCount > 0){
    	return callback(false);
    }
    else
    	return callback("error while create data");

 
  
  });

};

data.delete = function(collection,key,callback){
	  const db = client.db(dbName);
	  const col = db.collection(collection);
	   col.deleteOne(key, function(err, r) {
    

      if(!err && r.deletedCount > 0){
      	return callback(false);
      }
      else
      	return callback("error while deleting data");
	});

};

data.update = function(collection,key,data,callback){
	  const db = client.db(dbName);
	  const col = db.collection(collection);
	   col.findOneAndUpdate(key, {$set: data}, function(err, r) {

      if(!err && r.value){
      	return callback(false);
      }
      else
      	return callback("error while updating data");

  });
};




module.exports = data;