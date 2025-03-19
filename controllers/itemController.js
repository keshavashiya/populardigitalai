const itemService = require('../services/itemService');

const createItemCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await itemService.createItemCategory(name, description);
    res.status(201).json({ message: 'Item category created successfully', categoryId: result.categoryId });
  } catch (error) {
    console.error('Error creating item category:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to create item category' });
  }
};

const getItemCategories = async (req, res) => {
  try {
    const categories = await itemService.getItemCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting item categories:', error);
    res.status(500).json({ error: 'Failed to get item categories' });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, categoryId, unitPrice, description } = req.body;
    const result = await itemService.createItem(name, categoryId, unitPrice, description);
    res.status(201).json({ message: 'Item created successfully', itemId: result.itemId });
  } catch (error) {
    console.error('Error creating item:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to create item' });
  }
};

const getItems = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const items = await itemService.getItems(categoryId);
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
};

module.exports = {
  createItemCategory,
  getItemCategories,
  createItem,
  getItems
};