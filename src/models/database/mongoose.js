const mongoose = require('mongoose');

// const CONNECTION_URL = 'mongodb://172.17.0.2:27017/user-service';
const CONNECTION_URL = 'mongodb://tcp-mo4.mogenius.io:41050';
mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  user: "root",
  pass: "123456",
  dbName: "user-service"
});