describe('Login Page', () => {
    it('allows a user to log in', () => {
      cy.visit('http://localhost:3000/login'); // Change to your app’s login page
  
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
  
      cy.url().should('include', '/dashboard'); // Change to your post-login path
      cy.contains('Welcome'); // Adjust text based on what your app shows after login
    });
  });
  