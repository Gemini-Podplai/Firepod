import { test, expect } from './setup';

test.describe('Model Selection and Parameters', () => {
  test('should change AI model', async ({ authenticatedPage: page }) => {
    await page.goto('/chat');
    
    // Open model selection
    await page.getByTestId('model-selector').click();
    
    // Select a different model
    await page.getByRole('option', { name: /gpt-4/i }).click();
    
    // Verify model was changed
    await expect(page.getByTestId('model-selector')).toContainText('GPT-4');
    
    // Send a message to verify the model change persists
    await page.getByRole('textbox', { name: /message/i }).fill('What model are you?');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Check that response contains indication of the model
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 30000 });
    // Further verification depends on how the app displays model info in responses
  });
  
  test('should adjust temperature parameter', async ({ authenticatedPage: page }) => {
    await page.goto('/chat');
    
    // Open settings/parameters panel
    await page.getByRole('button', { name: /settings|parameters/i }).click();
    
    // Adjust temperature slider (assuming it uses a range input)
    const temperatureSlider = page.getByLabel(/temperature/i);
    
    // Get current value
    const originalValue = await temperatureSlider.inputValue();
    
    // Set to a specific value (e.g., 0.8)
    await temperatureSlider.fill('0.8');
    await page.getByRole('button', { name: /apply|save/i }).click();
    
    // Send a message to test with new settings
    await page.getByRole('textbox', { name: /message/i }).fill('Tell me a creative story in one sentence');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Verify we get a response (actual content would vary with temperature)
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 30000 });
    
    // Reopen settings to verify temperature persisted
    await page.getByRole('button', { name: /settings|parameters/i }).click();
    await expect(page.getByLabel(/temperature/i)).toHaveValue('0.8');
  });
  
  test('should adjust max tokens parameter', async ({ authenticatedPage: page }) => {
    await page.goto('/chat');
    
    // Open settings/parameters panel
    await page.getByRole('button', { name: /settings|parameters/i }).click();
    
    // Set max tokens to a lower value to test length limiting
    await page.getByLabel(/max tokens/i).fill('50');
    await page.getByRole('button', { name: /apply|save/i }).click();
    
    // Send a message that would typically generate a long response
    await page.getByRole('textbox', { name: /message/i }).fill('Explain quantum computing in detail');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 30000 });
    
    // Get response text and verify it's reasonably short due to token limit
    // This is somewhat approximate since tokens != characters
    const responseText = await page.getByTestId('assistant-message').textContent();
    expect(responseText?.length).toBeLessThan(400); // Rough approximation
  });
});
