/**
 * Common API helper functions
 * Useful for handling API requests and responses
 */

// Validate request body against a schema
const validateRequest = (req, schema) => {
  if (!schema) return { valid: true };
  
  // Basic validation (you might want to use a library like Joi or Yup)
  const errors = [];
  
  for (const [field, config] of Object.entries(schema)) {
    const value = req.body[field];
    
    if (config.required && (value === undefined || value === null)) {
      errors.push(`Field ${field} is required`);
      continue;
    }
    
    if (value !== undefined && config.type && typeof value !== config.type) {
      errors.push(`Field ${field} must be of type ${config.type}`);
    }
    
    if (value !== undefined && config.validate && !config.validate(value)) {
      errors.push(`Field ${field} validation failed`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Standard error response format
const errorResponse = (res, status, message, details = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(status).json(response);
};

// Standard success response format
const successResponse = (res, data = null, message = 'Success') => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(200).json(response);
};

// Async handler to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  validateRequest,
  errorResponse,
  successResponse,
  asyncHandler
};
