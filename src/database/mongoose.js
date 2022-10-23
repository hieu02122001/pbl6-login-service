const mongoose = require('mongoose');

const CONNECTION_URL = 'mongodb://172.17.0.2:27017/user-service';
mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
});