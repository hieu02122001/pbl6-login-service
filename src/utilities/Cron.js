const cron = require("node-cron");
const { SubscriptionManager } = require('../services/SubsManager');

const subsManager = new SubscriptionManager();

const taskCheckSubs = cron.schedule('1 0 0 * * *', async () =>  {
  const currentTime = new Date();
  console.log('\nChecking subscription at: ' + currentTime);
  const result = await subsManager.checkExpiredSubs();
  console.log('\nExpired Subscription count: ' + result.expiredCount);
  console.log('\nList expired subscription: ');
  for (const i in result.expiredList) {
    console.log("- " + result.expiredList[i]);
  }
}, {
  scheduled: false
});

module.exports = {
  taskCheckSubs
}