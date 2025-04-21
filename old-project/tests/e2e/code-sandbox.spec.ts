import { test, expect } from './setup';

test.describe('Code Sandbox Features', () => {
  test('should edit and run code', async ({ authenticatedPage: page }) => {
    // Navigate to code sandbox
    await page.goto('/sandbox');
    
    // Clear existing code (if any) and write new code
    await page.getByTestId('code-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('console.log("Hello from Playwright test");');
    
    // Run the code
    await page.getByRole('button', { name: /run/i }).click();
    
    // Verify output contains expected text
    await expect(page.getByTestId('code-output')).toContainText('Hello from Playwright test');
  });
  
  test('should support multiple languages in sandbox', async ({ authenticatedPage: page }) => {
    await page.goto('/sandbox');
    
    // Test Python
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('option', { name: /python/i }).click();
    
    // Clear editor and write Python code
    await page.getByTestId('code-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('print("Python test")');
    
    // Run the code
    await page.getByRole('button', { name: /run/i }).click();
    
    // Verify Python output
    await expect(page.getByTestId('code-output')).toContainText('Python test');
  });
  
  test('should save and load code snippets', async ({ authenticatedPage: page }) => {
    await page.goto('/sandbox');
    
    // Create unique snippet name using timestamp
    const snippetName = `Test Snippet ${Date.now()}`;
    
    // Write some code
    await page.getByTestId('code-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('// This is a test snippet\nconsole.log("Test snippet content");');
    
    // Save the snippet
    await page.getByRole('button', { name: /save/i }).click();
    await page.getByLabel('Snippet name').fill(snippetName);
    await page.getByRole('button', { name: /confirm|save/i }).click();
    
    // Clear editor
    await page.getByTestId('code-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    // Load the saved snippet
    await page.getByRole('button', { name: /load/i }).click();
    await page.getByText(snippetName).click();
    
    // Verify loaded content
    const editorContent = await page.getByTestId('code-editor').textContent();
    expect(editorContent).toContain('This is a test snippet');
    expect(editorContent).toContain('Test snippet content');
  });
});
