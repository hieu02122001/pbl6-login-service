const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//
const HASH_TIMES = 8;
//
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number!')
      }
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email wrong format!")
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7
  }
});
// middle-wares
userSchema.pre('save', async function (next) {
  const user = this;
  //
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, HASH_TIMES);
  }
  //
  next();
});
//
const User = mongoose.model('User', userSchema);

module.exports = {
  User
}