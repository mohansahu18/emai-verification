const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api/ApiController.js');

router.get('/sample', ApiController.sample);


//import lists routes
const listsRoutes = require('./lists.js');
router.use('/lists', listsRoutes);

module.exports = router;