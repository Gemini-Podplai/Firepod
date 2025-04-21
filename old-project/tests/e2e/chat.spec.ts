import { test, expect } from './setup';

test.describe('Chat Functionality', () => {
  test('should send a message and receive a response', async ({ authenticatedPage: page }) => {
    // Navigate to chat interface
    await page.goto('/chat');
    
    // Type and send a message
    await page.getByRole('textbox', { name: /message/i }).fill('Hello, can you help me with JavaScript?');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Verify the message appears in the chat
    await expect(page.getByTestId('user-message')).toContainText('Hello, can you help me with JavaScript?');
    
    // Verify we get a response (wait for streaming to complete)
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 30000 });
    await page.waitForFunction(() => 
      !document.querySelector('[data-testid="loading-indicator"]')?.isVisible
    );
  });
  
  test('should stream responses progressively', async ({ authenticatedPage: page }) => {
    await page.goto('/chat');
    
    // Send a message that would trigger a longer response
    await page.getByRole('textbox', { name: /message/i }).fill('Explain how promises work in JavaScript');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Verify streaming behavior by checking content changes over time
    await expect(page.getByTestId('assistant-message')).toBeVisible();
    
    // Capture initial content
    const initialContent = await page.getByTestId('assistant-message').textContent();
    
    // Wait a bit for streaming to progress
    await page.waitForTimeout(2000);
    
    // Capture updated content
    const updatedContent = await page.getByTestId('assistant-message').textContent();
    
    // Verify content has grown (streaming is working)
    expect(updatedContent?.length).toBeGreaterThan(initialContent?.length || 0);
  });

  test('should allow starting a new chat', async ({ authenticatedPage: page }) => {
    await page.goto('/chat');
    
    // Send a message
    await page.getByRole('textbox', { name: /message/i }).fill('Test message 1');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 30000 });
    
    // Start new chat
    await page.getByRole('button', { name: /new chat/i }).click();
    
    // Verify chat is cleared
    await expect(page.getByTestId('user-message')).toHaveCount(0);
    await expect(page.getByTestId('assistant-message')).toHaveCount(0);
  });
});
