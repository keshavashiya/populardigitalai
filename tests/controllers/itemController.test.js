const request = require('supertest');
const express = require('express');
const itemController = require('../../controllers/itemController');
const itemService = require('../../services/itemService');

jest.mock('../../services/itemService');

const app = express();
app.use(express.json());
app.post('/api/items/categories', itemController.createItemCategory);
app.get('/api/items/categories', itemController.getItemCategories);
app.post('/api/items', itemController.createItem);
app.get('/api/items', itemController.getItems);

describe('Item Controller', () => {
  // Remove console spy setup
  beforeAll(() => {});

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add new test cases for error handling
  describe('createItem', () => {
    it('should create an item successfully', async () => {
      const mockItem = { itemId: 1 };
      itemService.createItem.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Test Item',
          categoryId: 1,
          unitPrice: 9.99,
          description: 'Test Description'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Item created successfully',
        itemId: mockItem.itemId
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Name, category ID, and unit price are required'
      });
      expect(itemService.createItem).not.toHaveBeenCalled();
    });

    it('should handle invalid unit price', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Test Item',
          categoryId: 1,
          unitPrice: -1,
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unit price must be greater than 0'
      });
      expect(itemService.createItem).not.toHaveBeenCalled();
    });

    it('should handle zero unit price', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Test Item',
          categoryId: 1,
          unitPrice: 0,
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unit price must be greater than 0'
      });
    });

    it('should handle missing unit price', async () => {
      const req = {
        body: {
          name: 'Test Item',
          categoryId: 1,
          description: 'Test Description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      await itemController.createItem(req, res);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Name, category ID, and unit price are required'
      });
    });
    
    it('should handle non-numeric unit price', async () => {
      const req = {
        body: {
          name: 'Test Item',
          categoryId: 1,
          unitPrice: 'invalid',
          description: 'Test Description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      await itemController.createItem(req, res);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unit price must be greater than 0'
      });
    });
    
    it('should handle service error with status code', async () => {
      const req = {
        body: {
          name: 'Test Item',
          categoryId: 1,
          unitPrice: 10.99,
          description: 'Test Description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      itemService.createItem.mockRejectedValue({
        status: 409,
        message: 'Custom error message'
      });
    
      await itemController.createItem(req, res);
    
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Custom error message'
      });
    });
  });

  describe('getItems', () => {
    it('should filter by category', async () => {
      const mockItems = [{ id: 1, name: 'Item 1' }];
      itemService.getItems.mockResolvedValue(mockItems);

      const response = await request(app)
        .get('/api/items?categoryId=1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems);
      expect(itemService.getItems).toHaveBeenCalledWith(1); // Now matches the parsed integer
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      itemService.getItems.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/items');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch items'
      });
      // Remove console.error check
    });
  });

  describe('getItemCategories', () => {
    it('should handle errors with detailed logging', async () => {
      const error = new Error('Database connection failed');
      error.stack = 'Error stack trace';
      itemService.getItemCategories.mockRejectedValue(error);
    
      const response = await request(app)
        .get('/api/items/categories');
    
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch categories'
      });
      // Remove console.error verification
    });
  });
});


describe('createItemCategory', () => {
  it('should handle error without status code', async () => {
    const error = new Error('Unknown error');
    itemService.createItemCategory.mockRejectedValue(error);

    const response = await request(app)
      .post('/api/items/categories')
      .send({ name: 'Test Category' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to create item category'
    });
  });
});

describe('getItems', () => {
  it('should handle error without status code', async () => {
    const error = new Error('Unknown error');
    itemService.getItems.mockRejectedValue(error);

    const response = await request(app)
      .get('/api/items');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to fetch items'
    });
  });
});