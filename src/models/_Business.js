const mongoose = require('mongoose');
const validator = require('validator');
const lodash = require('lodash');
const { slug } = require('../utilities/Utilities');
//
const businessSchema = new mongoose.Schema({
  name: {
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
// # Middle-wares
// 
businessSchema.pre('save', async function (next) {
  const business = this;
  //
  business.slug = slug(business.name);
  //
  next();
});
//
const Business = mongoose.model('Business', businessSchema);

module.exports = {
  Business
}