const itemService = require('../services/itemService');

const createItemCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await itemService.createItemCategory(name.trim(), description);
    return res.status(201).json({
      message: 'Item category created successfully',
      categoryId: result.categoryId
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: 'Failed to create item category'
    });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, categoryId, unitPrice, description } = req.body;

    if (!name || !categoryId || unitPrice === undefined) {
      return res.status(400).json({
        error: 'Name, category ID, and unit price are required'
      });
    }

    // Add unit price validation before calling service
    const parsedPrice = parseFloat(unitPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        error: 'Unit price must be greater than 0'
      });
    }

    const result = await itemService.createItem(name, categoryId, unitPrice, description);
    return res.status(201).json({
      message: 'Item created successfully',
      itemId: result.itemId
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Failed to create item'
    });
  }
};

const getItems = async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;

    if (req.query.categoryId && isNaN(categoryId)) {
      return res.status(400).json({
        error: 'Invalid category ID'
      });
    }

    const items = await itemService.getItems(categoryId);
    return res.status(200).json(items);
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: 'Failed to fetch items'
    });
  }
};

const getItemCategories = async (req, res) => {
  try {
    const categories = await itemService.getItemCategories();
    return res.status(200).json(categories);
  } catch (error) {
    // Remove error logging
    return res.status(error.status || 500).json({
      error: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  createItemCategory,
  getItemCategories,
  createItem,
  getItems
};