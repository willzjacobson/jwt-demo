const bodyParser = require('body-parser');

module.exports = (app) => {
  app.use(bodyParser.json({ strict: false }));
  app.use(bodyParser.urlencoded({ extended: true }));
}
