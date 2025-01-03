const express = require('express');
const ListController = require('../controllers/list/ListController.js');
const router = express.Router();
const { upload, handleMulterError } = require('../middlewares/multer.js');
const TimeZoneController = require('../controllers/timezone/TimeZoneController.js');

// Routes for fetching time zone by country
router.get("/country", TimeZoneController.getTimezonesByCountry)

// Routes for saving time zone
router.post("/save", TimeZoneController.saveTimeZone)





module.exports = router;
