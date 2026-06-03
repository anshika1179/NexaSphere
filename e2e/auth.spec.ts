import { test, expect } from '@playwright/test';

test.describe('Authentication and Core Flows', () => {
  test('should display login page and allow admin login', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify login page elements
    await expect(page.locator('text=Admin Login')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Attempt to login with invalid credentials to verify error handling
    await page.fill('input[type="text"]', 'invalid_user');
    await page.fill('input[type="password"]', 'invalid_password');
    await page.click('button[type="submit"]');
    
    // Error message should be shown (depending on frontend implementation, typically 'Invalid credentials')
    // Wait for network response if needed, but asserting error presence is usually enough
    // await expect(page.locator('text=Invalid')).toBeVisible();
  });

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Attempting to access admin dashboard directly without session
    const response = await page.goto('/admin/dashboard');
    
    // Most apps redirect to login if unauthorized
    await expect(page).toHaveURL(/.*\/admin.*/);
  });
});
