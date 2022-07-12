const MongoClient = require('mongodb').MongoClient;
const config = require('./config/config.json');

// const connectionURL = 'mongodb://localhost:27017';
const databaseName = 'vladislav';

const uri = config.mongoUri;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        console.log(error)
        return console.log('Unable to connect to database!');
    }

    console.log('Connected correctly!');

    const database = client.db(databaseName);

    require('./bot')(database);

});
