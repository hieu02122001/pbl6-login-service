const mongoose = require('mongoose');
const lodash = require('lodash');
const validator = require('validator');
//
//
const subscriptionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  startTime: {
    type: Date,
    required:false,
  },
  endTime: {
    type: Date,
    required:false,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  price: {
    type: Number,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});
//
subscriptionSchema.methods.toJSON = function () {
  const PICK_FIELDS = ["_id", "businessId", "business", "startTime", "endTime", "packageId", "package", "price", "isDone", "createdAt", "updatedAt"];
  //
  const subscription = this;
  const subscriptionObject = lodash.pick(subscription, PICK_FIELDS);
  //
  return subscriptionObject;
}
//
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
  Subscription
}