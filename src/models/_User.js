const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//
const HASH_TIMES = 8;
const AUTH_KEY = 'shibabooking';
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
    unique: true,
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
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    }
  }],
});
// # Methods
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login!');
  }
  //
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login!');
  }
  //
  return user;
}
//
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  //
  const token = jwt.sign({
    _id: user._id.toString(),
  }, AUTH_KEY);
  //
  return token;
}
// # Middle-wares
// Hash password
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