require('dotenv').config()
const { MongoClient } = require('mongodb');
const colors = require('colors');


async function main(callback) {
    const URI = process.env.MONGO_URL || process.env['MONGO_URL'] ; // Declare MONGO_URI in your .env file
    const client = new MongoClient(URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect()
        console.log('MongoDB connected'.bgWhite.black);

        // Make the appropriate DB calls
        await callback(client);

    } catch (e) {
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }
}

module.exports = main;
