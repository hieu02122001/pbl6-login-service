const mongoose = require('mongoose');
const validator = require('validator');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
  },
  months: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
})

const Package = mongoose.model('Package', packageSchema);

module.exports = {
  Package
}