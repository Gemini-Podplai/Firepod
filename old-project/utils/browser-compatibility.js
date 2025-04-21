/**
 * Browser compatibility utilities
 * Provides methods for feature detection and browser-specific workarounds
 */

// Feature detection helpers
export const browserFeatures = {
  // Check if CSS Grid is supported
  cssGrid: () => typeof document !== 'undefined' && 'grid' in document.documentElement.style,
  
  // Check if Flexbox is supported
  flexbox: () => typeof document !== 'undefined' && 'flexBasis' in document.documentElement.style,
  
  // Check if WebP is supported
  webp: () => {
    return new Promise(resolve => {
      const webP = new Image();
      webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 1);
      };
    });
  },
  
  // Check if Web Audio API is supported
  webAudio: () => typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',

  // Check if canvas is supported
  canvas: () => typeof document !== 'undefined' && !!document.createElement('canvas').getContext,
};

// Browser identification (only use when absolutely necessary)
export const browserInfo = () => {
  if (typeof window === 'undefined') return { name: 'node', version: null };
  
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf("Edge") > -1) return { name: 'edge', version: userAgent.split("Edge/")[1] };
  if (userAgent.indexOf("Edg") > -1) return { name: 'edge-chromium', version: userAgent.split("Edg/")[1] };
  if (userAgent.indexOf("Chrome") > -1) return { name: 'chrome', version: userAgent.split("Chrome/")[1].split(" ")[0] };
  if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) return { name: 'safari', version: userAgent.split("Safari/")[1] };
  if (userAgent.indexOf("Firefox") > -1) return { name: 'firefox', version: userAgent.split("Firefox/")[1] };
  
  return { name: 'unknown', version: null };
};

// Apply polyfills based on feature detection
export const applyPolyfills = () => {
  // Polyfill for Array.prototype.flat
  if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
      configurable: true,
      writable: true,
      value: function() {
        const depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
        return depth ? Array.prototype.reduce.call(this, function(acc, cur) {
          if (Array.isArray(cur)) {
            acc.push.apply(acc, Array.prototype.flat.call(cur, depth - 1));
          } else {
            acc.push(cur);
          }
          return acc;
        }, []) : Array.prototype.slice.call(this);
      }
    });
  }

  // Add more polyfills as needed
};
