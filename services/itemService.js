const pool = require('../db/db');

const createItemCategory = async (name, description) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO item_categories (name, description) VALUES ($1, $2) RETURNING id',
      [name, description]
    );
    return { categoryId: result.rows[0].id };
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      throw { status: 400, message: 'Category name already exists' };
    }
    throw error;
  } finally {
    client.release();
  }
};

const getItemCategories = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, description, is_active FROM item_categories WHERE is_active = true'
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const createItem = async (name, categoryId, unitPrice, description) => {
  const client = await pool.connect();
  try {
    // Check if category exists
    const categoryResult = await client.query(
      'SELECT id FROM item_categories WHERE id = $1 AND is_active = true',
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      throw { status: 404, message: 'Category not found or inactive' };
    }

    const result = await client.query(
      'INSERT INTO items (name, category_id, unit_price, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, categoryId, unitPrice, description]
    );
    return { itemId: result.rows[0].id };
  } finally {
    client.release();
  }
};

const getItems = async (categoryId = null) => {
  const client = await pool.connect();
  try {
    let query = 'SELECT i.id, i.name, i.unit_price, i.description, i.is_active, '
               + 'c.id as category_id, c.name as category_name '
               + 'FROM items i '
               + 'JOIN item_categories c ON i.category_id = c.id '
               + 'WHERE i.is_active = true';
    const params = [];

    if (categoryId) {
      query += ' AND i.category_id = $1';
      params.push(categoryId);
    }

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  createItemCategory,
  getItemCategories,
  createItem,
  getItems
};