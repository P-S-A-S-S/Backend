
// CONNEXIÓ A LA BASE DE DADES //


//Connection daemon
const MongoClient = require('mongodb').MongoClient;
// Getting MongoDB ObjectID object
const ObjectID = require('mongodb').ObjectID;
// Connection URL, mongodb://10.5.0.2:27017/SASS connects directly to the desidered database
const url = 'mongodb://127.0.0.1:27017/';
// Database Name
const dbName = 'SASS';
// Additional MongoClient options
const mongoOptions = { useUnifiedTopology : true };

// Database state
const state = {
	db : null
};

//Database connection funciton
const connect = (callback) => {
	if(state.db)
		callback();
	else {
		MongoClient.connect(url, mongoOptions, (err,client) => {
			if(err)
				callback(err);
			else {
				state.db = client.db(dbName);
				callback();
			}

		});
	}
}

// Get primary keys function
const getPrimaryKey = (_id) => {
	return ObjectID(_id);
}

// Get database function
const getDB = () => {
	return state.db;
}

// Get Collections, returns Promise
const getColl = (collName) => {
	return state.db.collection(collName);
}

// Get documents from collection, returns Promise
const getDocuments = (coll, filter) => {
	return coll.find(filter).toArray();
}

// Insert one document into specified collection, returns Promise
const insertDocument = (coll, doc) => {
	return coll.insertOne(doc);
}

// Update the first document that matches the filter of the specified collection, returns Promise
const updateDocument = (coll, filter, update) => {
	return coll.updateOne(filter, update);
}

const updateColl = (coll, filter, update) => {
	return coll.updateMany(filter, update);
}

module.exports = {connect, getPrimaryKey, getDB, getColl, getDocuments, insertDocument, updateDocument, updateColl};