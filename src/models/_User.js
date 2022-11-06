const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const lodash = require('lodash');
//
const HASH_TIMES = 8;
const AUTH_KEY = 'shibabooking';
//
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
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
    minlength: 8
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: false,
    trim: true,
  },
  gender: {
    type: Boolean,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    }
  }],
});
// # virtual field
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
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
//
userSchema.methods.toJSON = function () {
  const PICK_FIELDS = ["firstName", "lastName", "fullName", "email", "phone", "avatar", "gender", "isActive", "isDeleted"];
  //
  const user = this;
  const userObject = lodash.pick(user, PICK_FIELDS);
  //
  userObject.id = lodash.get(user, "_id");
  userObject.gender = userObject.gender ? "Male" : "Female";
  //
  return userObject;
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