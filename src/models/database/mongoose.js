const mongoose = require('mongoose');

const CONNECTION_URL = 'mongodb+srv://root:trochoivui123@userservice.ogg6fgb.mongodb.net/user-service';
mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
});