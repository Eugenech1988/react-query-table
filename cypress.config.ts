const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'fvm3ak',
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    // If you want to test only one file, uncomment the following line:
    setupNodeEvents(on, config) {},
  },
});