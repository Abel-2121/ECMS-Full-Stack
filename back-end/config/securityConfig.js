
const {
  sanitizeRequestBody,
  escapeRequestBody,
  validateQueryParams,
  validateRouteParams,
  validateRequestBody,
  sanitizeHeaders,
  validateHeaders,
  setSecurityHeaders,
  logSuspiciousActivity,
  limitRequestBodySize
} = require('../middleware/securityMiddleware');
const app = require("../app");
const express = require("express");

const applySecurity = (app) => {
  // 1. Body size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(limitRequestBodySize('10mb'));
  
  // 2. Security headers
  app.use(setSecurityHeaders);
  
  // 3. Sanitization (remove XSS)
  app.use(sanitizeHeaders);
  app.use(sanitizeRequestBody);
  
  // 4. Escape special chars (prevent injection)
  app.use(escapeRequestBody);
  
  // 5. Validation
  app.use(validateHeaders);
  app.use(validateQueryParams);
  app.use(validateRouteParams);
  app.use(validateRequestBody);
  
  // 6. Logging
  app.use(logSuspiciousActivity);
};

module.exports = applySecurity;