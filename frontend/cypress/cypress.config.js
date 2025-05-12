// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000', // Assuming frontend runs on port 3000
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false, // Disable video recording to save space, enable for CI if needed
        setupNodeEvents(on, config) {
            // implement node event listeners here
            // For example, a task to reset the database:
            // on('task', {
            //   resetDb: () => {
            //     // Code to call your backend's DB reset endpoint or script
            //     return null;
            //   }
            // });
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // This pattern correctly finds nested files
        supportFile: 'cypress/support/e2e.js',
    },
    env: {
        API_URL: 'http://127.0.0.1:5000/api', // Backend API URL
    },
});