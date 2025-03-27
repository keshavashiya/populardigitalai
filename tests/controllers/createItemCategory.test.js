const { createItemCategory } = require('../../controllers/itemController');
const itemService = require('../../services/itemService');

// Mock itemService
jest.mock('../../services/itemService');

describe('createItemCategory', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should create a category successfully', async () => {
    // Arrange
    const categoryData = {
      name: 'Test Category',
      description: 'Test Description'
    };
    mockRequest.body = categoryData;
    
    itemService.createItemCategory.mockResolvedValue({ categoryId: 1 });

    // Act
    await createItemCategory(mockRequest, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Item category created successfully',
      categoryId: 1
    });
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    mockRequest.body = { description: 'Test Description' };

    // Act
    await createItemCategory(mockRequest, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Category name is required'
    });
  });

  it('should handle database errors', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Test Category',
      description: 'Test Description'
    };
    
    const dbError = new Error('Database error');
    itemService.createItemCategory.mockRejectedValue(dbError);

    // Act
    await createItemCategory(mockRequest, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Failed to create item category'
    });
  });
});