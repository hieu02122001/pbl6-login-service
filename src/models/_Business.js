const mongoose = require('mongoose');
const validator = require('validator');
const lodash = require('lodash');
//
const businessSchema = new mongoose.Schema({
  name: {
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
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  }
}, {
  timestamps: true
});
//
const Business = mongoose.model('Business', businessSchema);

module.exports = {
  Business
}