module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  collectCoverageFrom: [
    'controllers/itemController.js',
    'services/itemService.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'getItemCategories.js',
    'getItems.js',
    'createItem.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};