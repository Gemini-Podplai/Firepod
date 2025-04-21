/**
 * Client-side reCAPTCHA integration for Dartopia/Podplay
 * 
 * This file provides functions for integrating reCAPTCHA v3 on the client side.
 * Include this script after loading the reCAPTCHA API script.
 */

// Your actual site key from Google reCAPTCHA
const RECAPTCHA_SITE_KEY = '6Lcsaw0rAAAAAF-8oFDLGGEryTiR4PicnW7lyMNv';

/**
 * Initialize reCAPTCHA on page load
 */
function initRecaptcha() {
  // Load the reCAPTCHA script
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
  document.head.appendChild(script);
  
  console.log('reCAPTCHA script loaded');
}

/**
 * Get a reCAPTCHA token for a specific action
 * @param {string} action - The action name (e.g., 'login', 'signup')
 * @returns {Promise<string>} - The reCAPTCHA token
 */
function getRecaptchaToken(action) {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }
    
    window.grecaptcha.enterprise.ready(() => {
      window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action })
        .then(token => {
          resolve(token);
        })
        .catch(error => {
          console.error('reCAPTCHA error:', error);
          reject(error);
        });
    });
  });
}

/**
 * Example usage with a login form
 * @param {Event} event - Form submission event
 */
async function handleLoginForm(event) {
  event.preventDefault();
  
  try {
    // Show loading indicator
    document.getElementById('login-status').textContent = 'Verifying...';
    
    // Get reCAPTCHA token using your site key
    const token = await getRecaptchaToken('login');
    
    // Use a proper domain without protocol, port, or path
    // For reCAPTCHA registration use: podplay.com (or your actual domain)
    // For local development, register 'localhost' (without port)
    const domain = window.location.hostname; // This gives just the hostname without port
    
    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Send to your backend API with domain information
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        recaptchaToken: token,
        domain // Include domain in the request body
      })
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById('login-status').textContent = 'Login successful!';
      window.location.href = '/dashboard';
    } else {
      document.getElementById('login-status').textContent = result.message || 'Login failed';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('login-status').textContent = 'An error occurred during login';
  }
}

// Initialize reCAPTCHA when the document is loaded
document.addEventListener('DOMContentLoaded', initRecaptcha);