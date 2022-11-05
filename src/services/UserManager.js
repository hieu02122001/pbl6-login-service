const lodash = require('lodash');
const { User } = require('../models/_User');

function UserManager(params) {

};

UserManager.prototype.findUsers = async function(criteria, more) {
  const users = await User.find({});
  const output = {
    rows: users,
    count: users.length
  }
  return output;
};

module.exports = { UserManager };