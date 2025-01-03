const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/backend/UsersController');

// Routes for creating a new user
router.post('/', UsersController.create);

// Routes for getting all users
router.get('/', UsersController.getAll);

// Routes for getting a single user credit history
router.get('/credit', UsersController.creditHistory);

// Routes for getting a user timezone
router.get('/time-zone/:timeZone', UsersController.timeZone);

// Routes for getting a  user
router.get('/:user_id', UsersController.getOne);

// Routes for updating a  user
router.put('/:user_id', UsersController.updateOne);

// Routes for deleting a  user
router.delete('/:user_id', UsersController.deleteOne);


module.exports = router;