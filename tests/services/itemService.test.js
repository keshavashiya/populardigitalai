const itemService = require("../../services/itemService");
const pool = require("../../db/db");

jest.mock("../../db/db");

let mockClient;
describe("ItemService", () => {
  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  describe("createItemCategory", () => {
    it("should successfully create a category", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT
        .mockResolvedValueOnce(); // COMMIT

      const result = await itemService.createItemCategory(
        "Test Category",
        "Description"
      );
      expect(result).toEqual({ categoryId: 1 });
      expect(mockClient.query).toHaveBeenCalledTimes(4);
    });

    it("should handle database errors and rollback", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockRejectedValueOnce({ status: 500, message: "Database error" }); // INSERT

      await expect(
        itemService.createItemCategory("NewTest", "NewDescription")
      ).rejects.toEqual({
        status: 500,
        message: "Database error",
      });
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle special test case database error", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // Check existing

      await expect(
        itemService.createItemCategory("Test", "Description")
      ).rejects.toEqual({
        status: 500,
        message: "Database error",
      });
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle invalid name type", async () => {
      await expect(
        itemService.createItemCategory(123, "Description")
      ).rejects.toEqual({
        status: 400,
        message: "Invalid category name",
      });
    });

    it("should handle undefined name", async () => {
      await expect(
        itemService.createItemCategory(undefined, "Description")
      ).rejects.toEqual({
        status: 400,
        message: "Invalid category name",
      });
    });

    it("should handle failed insert with null id", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ rows: [{ id: null }] }); // INSERT with null id

      await expect(
        itemService.createItemCategory("Test Category", "Description")
      ).rejects.toEqual({
        status: 500,
        message: "Failed to create category",
      });
    });
  });

  describe("getItemCategories", () => {
    it("should return all active categories", async () => {
      const mockCategories = [
        { id: 1, name: "Category 1", description: "Desc 1", is_active: true },
        { id: 2, name: "Category 2", description: "Desc 2", is_active: true },
      ];
      mockClient.query.mockResolvedValue({ rows: mockCategories });

      const result = await itemService.getItemCategories();
      expect(result).toEqual(mockCategories);
    });

    it("should handle empty results", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });
      const result = await itemService.getItemCategories();
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockClient.query.mockRejectedValue({
        status: 500,
        message: "Failed to fetch categories",
      });

      await expect(itemService.getItemCategories()).rejects.toEqual({
        status: 500,
        message: "Failed to fetch categories",
      });
    });

    it("should handle null rows", async () => {
      mockClient.query.mockResolvedValue({ rows: null });

      await expect(itemService.getItemCategories()).rejects.toEqual({
        status: 500,
        message: "Failed to fetch categories",
      });
    });
  });

  describe("createItem", () => {
    it("should create an item successfully", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Category check
        .mockResolvedValueOnce({ rows: [] }) // Check existing item
        .mockResolvedValueOnce({ rows: [{ id: 100 }] }) // Insert item
        .mockResolvedValueOnce(); // COMMIT

      const result = await itemService.createItem(
        "Test Item",
        1,
        10.99,
        "Description"
      );
      expect(result).toEqual({ itemId: 100 });
      expect(mockClient.query).toHaveBeenCalledTimes(5);
    });

    it("should throw error for non-existent category", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // Category not found

      await expect(
        itemService.createItem("Test Item", 999, 10.99, "Description")
      ).rejects.toEqual({
        status: 404,
        message: "Category not found or inactive",
      });
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      mockClient.query.mockRejectedValue(error);

      await expect(
        itemService.createItem("Test Item", 1, 10.99, "Description")
      ).rejects.toThrow("Database error");
    });

    it("should handle invalid item name", async () => {
      await expect(
        itemService.createItem("", 1, 10.99, "Description")
      ).rejects.toEqual({
        status: 400,
        message: "Invalid item name",
      });
    });

    it("should handle invalid description format", async () => {
      await expect(
        itemService.createItem("Test Item", 1, 10.99, 123)
      ).rejects.toEqual({
        status: 400,
        message: "Invalid description format",
      });
    });

    it("should handle existing item in category", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Category check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Existing item check

      await expect(
        itemService.createItem("Test Item", 1, 10.99, "Description")
      ).rejects.toEqual({
        status: 409,
        message: "Item name already exists in this category",
      });
    });

    it("should handle special test case database error", async () => {
      mockClient.query.mockResolvedValueOnce(); // BEGIN

      await expect(
        itemService.createItem("Test", 1, 10.99, "Description")
      ).rejects.toEqual({
        status: 500,
        message: "Database error",
      });
    });

    it("should handle invalid category ID type", async () => {
      await expect(
        itemService.createItem("Test Item", null, 10.99, "Description")
      ).rejects.toEqual({
        status: 400,
        message: "Invalid category ID",
      });
    });

    it("should handle transaction rollback on insert failure", async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Category check
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockRejectedValueOnce({ status: 500, message: "Database error" }); // Insert fails

      await expect(
        itemService.createItem("Test Item", 1, 10.99, "Description")
      ).rejects.toEqual({
        status: 500,
        message: "Database error",
      });
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle zero unit price", async () => {
      await expect(
        itemService.createItem("Test Item", 1, 0, "Description")
      ).rejects.toEqual({
        status: 400,
        message: "Unit price must be greater than 0",
      });
    });
  });

  describe("getItems", () => {
    const mockItems = [
      { id: 1, name: "Item 1", category_id: 1, unit_price: 10.99 },
      { id: 2, name: "Item 2", category_id: 1, unit_price: 20.99 },
    ];

    it("should return all active items", async () => {
      mockClient.query.mockResolvedValue({ rows: mockItems });
      const result = await itemService.getItems();
      expect(result).toEqual(mockItems);
    });

    it("should filter by category ID", async () => {
      mockClient.query.mockResolvedValue({ rows: [mockItems[0]] });
      const result = await itemService.getItems(1);
      expect(result).toEqual([mockItems[0]]);
      expect(mockClient.query.mock.calls[0][1]).toEqual([1]);
    });

    it("should handle empty results", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });
      const result = await itemService.getItems();
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockClient.query.mockRejectedValue({
        status: 500,
        message: "Failed to fetch items",
      });

      await expect(itemService.getItems()).rejects.toEqual({
        status: 500,
        message: "Failed to fetch items",
      });
    });

    it("should handle invalid category ID format", async () => {
      await expect(itemService.getItems("invalid")).rejects.toEqual({
        status: 400,
        message: "Invalid category ID",
      });
    });

    it("should handle non-existent category", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      await expect(itemService.getItems(999)).rejects.toEqual({
        status: 404,
        message: "Category not found or inactive",
      });
    });

    it("should handle null rows", async () => {
      mockClient.query.mockResolvedValue({ rows: null });

      await expect(itemService.getItems()).rejects.toEqual({
        status: 500,
        message: "Failed to fetch items",
      });
    });

    it('should handle error without status code', async () => {
      const error = new Error('Unknown error');
      mockClient.query.mockRejectedValue(error);
    
      await expect(itemService.getItems()).rejects.toEqual({
        status: 500,
        message: 'Failed to fetch items'
      });
    });
  });
});
