const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const lodash = require('lodash');
const { slug } = require('../utilities/Utilities');
//
const HASH_TIMES = 8;
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
  slug: {
    type: String,
    required:false,
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
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
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
}, {
  timestamps: true
});
// # virtual field
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
// # Methods
userSchema.statics.findByCredentials = async (email, password, more) => {
  const { role } = more;
  const MAPPING_ROLE = {
    CLIENT : ["636723d347707eeadf80eb59"],
    ADMIN : ["63671e8c83f50d47ea00f803", "636723c71f1cbcef36804e82"]
  }
  const user = await User.findOne({ 
    email,
    roleId: {
      $in: MAPPING_ROLE[role]
    } });
  if (!user) {
    throw new Error('This email doesn\'t exist!');
  }
  //
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Wrong password!');
  }
  //
  return user;
}
//
userSchema.methods.toJSON = function () {
  const PICK_FIELDS = ["_id", "firstName", "lastName", "fullName", "slug", "email", "phone", "avatar", "gender", "roleId", "businesses"];
  //
  const user = this;
  const userObject = lodash.pick(user, PICK_FIELDS);
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
  user.slug = slug(user.fullName);
  //
  next();
});
//
const User = mongoose.model('User', userSchema);

module.exports = {
  User
}