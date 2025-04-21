/**
 * Cross-browser compatibility test suite
 * 
 * Run these tests across different browsers to detect compatibility issues
 */

import { browserTest, featureTest, logBrowserEnvironment } from '../utils/cross-browser-testing';
import { browserFeatures, applyPolyfills } from '../utils/browser-compatibility';

// Apply polyfills before tests run
beforeAll(() => {
  applyPolyfills();
  logBrowserEnvironment();
});

describe('Layout Tests', () => {
  test('Flexbox layout renders correctly', async () => {
    await featureTest('flexbox', () => {
      // Test flexbox layout rendering
      document.body.innerHTML = `
        <div id="flex-container" style="display: flex; justify-content: space-between;">
          <div style="width: 100px; height: 100px;"></div>
          <div style="width: 100px; height: 100px;"></div>
        </div>
      `;
      
      const container = document.getElementById('flex-container');
      expect(container.childNodes[0].getBoundingClientRect().left).toBeLessThan(
        container.childNodes[1].getBoundingClientRect().left
      );
    });
  });
  
  test('Grid layout renders correctly', async () => {
    await featureTest('cssGrid', () => {
      // Test CSS grid layout rendering
      document.body.innerHTML = `
        <div id="grid-container" style="display: grid; grid-template-columns: 1fr 1fr;">
          <div style="width: 100px; height: 100px;"></div>
          <div style="width: 100px; height: 100px;"></div>
        </div>
      `;
      
      const container = document.getElementById('grid-container');
      expect(container.childNodes[0].getBoundingClientRect().left).toBeLessThan(
        container.childNodes[1].getBoundingClientRect().left
      );
    });
  });
});

describe('Feature Tests', () => {
  test('Canvas API works correctly', async () => {
    await featureTest('canvas', () => {
      document.body.innerHTML = '<canvas id="test-canvas" width="100" height="100"></canvas>';
      const canvas = document.getElementById('test-canvas');
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 50, 50);
      
      // This is a simple test - in real tests you might compare canvas content
      expect(canvas.width).toBe(100);
      expect(canvas.height).toBe(100);
    });
  });
  
  test('Audio API initialized correctly', async () => {
    await featureTest('webAudio', () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      
      expect(context).toBeTruthy();
      expect(context.state).toBeDefined();
    });
  });
  
  browserTest('safari', () => {
    test('Safari-specific features work correctly', () => {
      // Safari-specific tests
      expect(document.documentElement.style.webkitUserSelect).toBeDefined();
    });
  });
});

// Run browser-specific tests
browserTest('firefox', () => {
  test('Firefox-specific fixes are applied', () => {
    // Firefox-specific assertions
  });
});

browserTest('edge', () => {
  test('Edge-specific fixes are applied', () => {
    // Edge-specific assertions
  });
});
