const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const { SubscriptionManager } = require('../services/SubsManager');

const PATH = '/api/v1';

const subscriptionManager = new SubscriptionManager();

router.get(PATH + '/subscriptions', async (req, res) => {
  const { query } = req;
  try {
    const criteria = {};
    // pagination
    if(query && query.page) {
      lodash.set(criteria, "page", query.page);
    }
    //
    if(query && query.businessId) {
      lodash.set(criteria, "businessId", query.businessId);
    }
    //
    const subscriptions = await subscriptionManager.findSubscriptions(criteria);
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