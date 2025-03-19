const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Item Categories
router.post('/categories', itemController.createItemCategory);
router.get('/categories', itemController.getItemCategories);

// Items
router.post('/', itemController.createItem);
router.get('/', itemController.getItems);

module.exports = router;