module.exports = {
  connect: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    release: jest.fn()
  }))
};