const mongoose = require('mongoose');
const app = require('express')();

// Variables passed in by docker-compose
const { PORT, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_HOST, DB } = process.env;

const dbConnectionString = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST}/${DB}`;


// ===== CONNECT TO DB AND START SERVER =====

let serverStarted = false;
(function connectToDB() {

	mongoose.connect(dbConnectionString, { useNewUrlParser: true });
	const db = mongoose.connection;
	
	// If fail to connect to DB, try again.
	db.on('error', () => {
			console.log('Failed to connect to DB, trying again.');
			setTimeout(connectToDB, 3000);
	});

	// Once connected to DB, define mongood model and start express server
	db.once('open', async () => {
			console.log('Connected to DB, starting server.')
			if (!serverStarted) {
					app.listen(PORT, () => console.log(`The server is listening closely on port ${PORT}...`));
			}
			// Intentionally not put in callback so that we dont try to start the server twice
			serverStarted = true;
	});
})()

require('./middleware')(app);
app.use(require('./routes'));


// -=-=-=-=-=-=-=-  End-o-the-line error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json(`Could not match route ${req.method} ${req.url}`);
});

