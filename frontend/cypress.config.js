// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000', 
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false, 
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', 
        supportFile: 'cypress/support/e2e.js',
    },
    env: {
        API_URL: 'http://127.0.0.1:5000/api', // Backend API URL
    },
});