const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const { SubscriptionManager } = require('../services/SubsManager');

const PATH = '/api/v1';

const subscriptionManager = new SubscriptionManager();

router.get(PATH + '/subscriptions', async (req, res) => {
  try {
    const subscriptions = await subscriptionManager.findSubscriptions();
    for (const i in subscriptions.rows) {
      subscriptions.rows[i] = await subscriptionManager.wrapExtraToSubscriptions(subscriptions.rows[i]);
    }
    //
    res.send(subscriptions);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/subscriptions', async (req, res) => {
  const PICK_FIELDS = ["businessId", "startTime", "packageId"];
  const subscriptionObj = lodash.pick(req.body, PICK_FIELDS);
  //
  try {
    const subscription = await subscriptionManager.createSubscription(subscriptionObj);
    //
    res.send(subscription);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/subscriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const subscription = await subscriptionManager.getSubscription(id);
    //
    res.send(subscription);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;