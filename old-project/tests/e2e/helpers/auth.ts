import { Page } from '@playwright/test';

export async function login(page: Page): Promise<void> {
  await page.goto('/');
  
  // Check if already logged in
  if (await page.getByRole('button', { name: /logout/i }).isVisible().catch(() => false)) {
    return;
  }

  // Implement your authentication flow here
  // Example:
  await page.getByRole('button', { name: /login/i }).click();
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for authentication to complete
  await page.waitForSelector('[data-testid="user-avatar"]', { state: 'visible' });
}
