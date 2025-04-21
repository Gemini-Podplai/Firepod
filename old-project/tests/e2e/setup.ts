import { test as base } from '@playwright/test';
import { login } from './helpers/auth';

// Extend the base test to include custom fixture for logged in state
export const test = base.extend({
  // Automatically log in for tests that require authentication
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  }
});

export { expect } from '@playwright/test';
