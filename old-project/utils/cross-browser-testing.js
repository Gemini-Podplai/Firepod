/**
 * Cross-browser testing utilities
 * 
 * These utilities help with setting up and running tests across different browsers
 * Use with testing frameworks like Jest, Cypress, or Playwright
 */

import { browserInfo, browserFeatures } from './browser-compatibility';

/**
 * Runs a test only if the current browser matches specified criteria
 * @param {string} browserName - Browser name to target (chrome, firefox, safari, edge) or 'all'
 * @param {function} testFn - The test function to run
 */
export const browserTest = (browserName, testFn) => {
  const current = browserInfo();
  
  if (browserName === 'all' || current.name === browserName) {
    testFn();
  } else {
    console.log(`Test skipped: not running in ${browserName}`);
  }
};

/**
 * Runs a test only if a specific feature is supported
 * @param {string} featureName - Feature to check from browserFeatures
 * @param {function} testFn - The test function to run
 */
export const featureTest = async (featureName, testFn) => {
  if (!browserFeatures[featureName]) {
    console.error(`Unknown feature: ${featureName}`);
    return;
  }
  
  const isSupported = await Promise.resolve(browserFeatures[featureName]());
  
  if (isSupported) {
    testFn();
  } else {
    console.log(`Test skipped: ${featureName} not supported`);
  }
};

/**
 * Logs browser details and supported features
 * Useful for debugging cross-browser issues
 */
export const logBrowserEnvironment = async () => {
  const browser = browserInfo();
  console.log('Browser:', browser.name, browser.version);
  
  const features = {};
  for (const [key, check] of Object.entries(browserFeatures)) {
    features[key] = await Promise.resolve(check());
  }
  
  console.log('Supported features:', features);
  console.log('User Agent:', navigator.userAgent);
  console.log('Screen:', {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio
  });
};

/**
 * Create screenshot comparison tests
 * @param {string} testName - Name of the test
 * @param {function} setupFn - Function to set up the UI state
 */
export const visualRegressionTest = (testName, setupFn) => {
  // Implementation would depend on your testing framework
  // This is a placeholder for the concept
  console.log(`Running visual regression test: ${testName}`);
  setupFn();
  console.log('Screenshot would be taken and compared here');
};
