const mongoose = require('mongoose');
const validator = require('validator');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
})

const Role = mongoose.model('Role', roleSchema);

module.exports = {
  Role
}