
// CONNEXIÓ A LA BASE DE DADES //


//Connection daemon
const MongoClient = require('mongodb').MongoClient;
// Getting MongoDB ObjectID object
const ObjectID = require('mongodb').ObjectID;
// Connection URL, mongodb://10.5.0.2:27017/SASS connects directly to the desidered database
const url = 'mongodb://10.5.0.2:27017/';
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

// Get collection function
const getColl = (collName) => {
	return state.db.collection(collName);
}

// Get Documents from collection
const getCursor = (collName, filter) => {
	return state.db.collection(collName).find(filter);
}

module.exports = {getDB, getColl, getCursor, connect, getPrimaryKey};
