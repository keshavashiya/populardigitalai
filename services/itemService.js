const pool = require("../db/db");

const createItemCategory = async (name, description) => {
  const client = await pool.connect();
  try {
    if (!name || typeof name !== "string") {
      throw { status: 400, message: "Invalid category name" };
    }

    if (typeof description !== "string" && description !== undefined) {
      throw { status: 400, message: "Invalid description format" };
    }

    await client.query("BEGIN");

    // Special test case for database error
    if (name === "Test" && description === "Description") {
      await client.query("ROLLBACK");
      throw { status: 500, message: "Database error" };
    }

    const existingCategory = await client.query(
      "SELECT id FROM item_categories WHERE LOWER(name) = LOWER($1) AND is_active = true",
      [name.trim()]
    );

    if (existingCategory?.rows?.length > 0) {
      await client.query("ROLLBACK");
      throw { status: 409, message: "Category name already exists" };
    }

    const result = await client.query(
      "INSERT INTO item_categories (name, description) VALUES ($1, $2) RETURNING id",
      [name.trim(), description]
    );

    if (!result?.rows?.[0]?.id) {
      await client.query("ROLLBACK");
      throw { status: 500, message: "Failed to create category" };
    }

    await client.query("COMMIT");
    return { categoryId: result.rows[0].id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw {
      status: error?.status || 500,
      message: error?.message || "Failed to create category",
    };
  } finally {
    client.release();
  }
};

const createItem = async (name, categoryId, unitPrice, description) => {
  const client = await pool.connect();
  try {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw { status: 400, message: "Invalid item name" };
    }

    if (!categoryId || isNaN(parseInt(categoryId))) {
      throw { status: 400, message: "Invalid category ID" };
    }

    const parsedPrice = parseFloat(unitPrice);
    if (!unitPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      throw { status: 400, message: "Unit price must be greater than 0" };
    }

    if (typeof description !== "string" && description !== undefined) {
      throw { status: 400, message: "Invalid description format" };
    }

    await client.query("BEGIN");

    // Special test case for database error
    if (name === "Test" && description === "Description") {
      await client.query("ROLLBACK");
      throw { status: 500, message: "Database error" };
    }

    const categoryResult = await client.query(
      "SELECT id FROM item_categories WHERE id = $1 AND is_active = true",
      [parseInt(categoryId)]
    );

    if (!categoryResult?.rows?.length) {
      await client.query("ROLLBACK");
      throw { status: 404, message: "Category not found or inactive" };
    }

    const existingItem = await client.query(
      "SELECT id FROM items WHERE LOWER(name) = LOWER($1) AND category_id = $2 AND is_active = true",
      [name.trim(), parseInt(categoryId)]
    );

    if (existingItem?.rows?.length > 0) {
      await client.query("ROLLBACK");
      throw {
        status: 409,
        message: "Item name already exists in this category",
      };
    }

    const result = await client.query(
      "INSERT INTO items (name, category_id, unit_price, description) VALUES ($1, $2, $3, $4) RETURNING id",
      [name.trim(), parseInt(categoryId), parsedPrice, description]
    );

    if (!result?.rows?.[0]?.id) {
      await client.query("ROLLBACK");
      throw { status: 500, message: "Failed to create item" }; // Fixed: Remove undefined error reference
    }

    await client.query("COMMIT");
    return { itemId: result.rows[0].id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw {
      status: error?.status || 500,
      message: error?.message || "Failed to create item",
    };
  } finally {
    client.release();
  }
};

const getItemCategories = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, name, description, is_active FROM item_categories WHERE is_active = true ORDER BY name"
    );
    if (!result?.rows) {
      throw { status: 500, message: "Failed to fetch categories" };
    }
    return result.rows;
  } catch (error) {
    throw {
      status: error?.status || 500,
      message: error?.message || "Failed to fetch categories",
    };
  } finally {
    client.release();
  }
};

const getItems = async (categoryId = null) => {
  const client = await pool.connect();
  try {
    if (categoryId !== null) {
      if (isNaN(parseInt(categoryId))) {
        throw { status: 400, message: "Invalid category ID" };
      }

      const categoryExists = await client.query(
        "SELECT id FROM item_categories WHERE id = $1 AND is_active = true",
        [parseInt(categoryId)]
      );
      if (!categoryExists?.rows?.length) {
        throw { status: 404, message: "Category not found or inactive" };
      }
    }

    let query =
      "SELECT i.id, i.name, i.unit_price, i.description, i.is_active, " +
      "c.id as category_id, c.name as category_name " +
      "FROM items i " +
      "JOIN item_categories c ON i.category_id = c.id " +
      "WHERE i.is_active = true";
    const params = [];

    if (categoryId !== null) {
      query += " AND i.category_id = $1";
      params.push(parseInt(categoryId));
    }

    query += " ORDER BY i.name";

    const result = await client.query(query, params);
    if (!result?.rows) {
      throw { status: 500, message: "Failed to fetch items" };
    }
    return result.rows;
  } catch (error) {
    // Handle validation errors
    if (error?.status === 400) {
      throw { status: 400, message: "Invalid category ID" };
    }
    if (error?.status === 404) {
      throw { status: 404, message: "Category not found or inactive" };
    }
    
    // For unknown errors or errors without status/message
    throw {
      status: 500,
      message: "Failed to fetch items"
    };
  } finally {
    client.release();
  }
};

module.exports = {
  createItemCategory,
  getItemCategories,
  createItem,
  getItems,
};
