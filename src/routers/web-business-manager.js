const express = require('express');
const lodash = require('lodash');
const router = new express.Router();
const { User } = require('../models/_User');
const { Business } = require('../models/_Business');
const { BusinessManager } = require('../services/BusinessManager');
const { auth } = require('../middleware/auth');

const PATH = '/api/v1';

const businessManager = new BusinessManager();

router.post(PATH + '/businesses', async (req, res) => {
  const PICK_FIELDS = ["name", "email", "phone", "isActive"];
  const businessObj = lodash.pick(req.body, PICK_FIELDS);
  //
  try {
    const { business } = await businessManager.createBusiness(businessObj);
    //
    res.send(business);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/businesses', auth, async (req, res) => {
  const { query } = req;
  try {
    const criteria = {};
    // pagination
    if(query && query.page) {
      lodash.set(criteria, "page", query.page);
    }
    // search: slug/phone/email
    if(query && query.search) {
      lodash.set(criteria, "search", query.search);
    }
    //
    if(query && query.isActive) {
      criteria.isActive = query.isActive === "active";
    }
    //
    const businesses = await businessManager.findBusinesses(criteria);
    //
    res.send(businesses);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/businesses/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const business = await businessManager.getBusiness(id);
    //
    res.send(business);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.put(PATH + '/businesses/:id', auth, async (req, res) => {
  const PICK_FIELDS = ["name", "email", "phone", "isActive"];
  const businessObj = lodash.pick(req.body, PICK_FIELDS);
  const { id } = req.params;
  //
  try {
    const business = await businessManager.updateBusiness(id, businessObj);
    //
    res.send(business);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete(PATH + '/businesses/:id', auth, async (req, res) => {
  const { id } = req.params;
  //
  try {
    const business = await businessManager.deleteBusiness(id);
    //
    res.send(business);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;