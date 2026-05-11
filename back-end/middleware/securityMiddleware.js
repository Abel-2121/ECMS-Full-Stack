const { securityValidators } = require('../utils/validators');


const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return securityValidators.sanitizeInput(value);
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }
  if (value && typeof value === 'object' && value !== null) {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};


const escapeValue = (value) => {
  if (typeof value === 'string') {
    return securityValidators.escapeSpecialChars(value);
  }
  if (Array.isArray(value)) {
    return value.map(item => escapeValue(item));
  }
  if (value && typeof value === 'object' && value !== null) {
    const escaped = {};
    for (const [key, val] of Object.entries(value)) {
      escaped[key] = escapeValue(val);
    }
    return escaped;
  }
  return value;
};


const isValueSafe = (value, path = '') => {
  if (typeof value === 'string') {
    return securityValidators.isSafeQuery(value);
  }
  if (Array.isArray(value)) {
    return value.every((item, index) => isValueSafe(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object' && value !== null) {
    return Object.entries(value).every(([key, val]) => 
      isValueSafe(val, `${path}.${key}`)
    );
  }
  return true;
};

const sanitizeRequestBody = (req, res, next) => {
  if (!req.body) return next();
  
  try {
    req.body = sanitizeValue(req.body);
    next();
  } catch (error) {
    console.error('[SECURITY] Sanitization error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid request body format',
      code: 'INVALID_BODY_FORMAT'
    });
  }
};


const escapeRequestBody = (req, res, next) => {
  if (!req.body) return next();
  
  try {
    req.body = escapeValue(req.body);
    next();
  } catch (error) {
    console.error('[SECURITY] Escape error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid request body format',
      code: 'INVALID_BODY_FORMAT'
    });
  }
};


const validateQueryParams = (req, res, next) => {
  if (!req.query || Object.keys(req.query).length === 0) {
    return next();
  }
  
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string' && !securityValidators.isSafeQuery(value)) {
      console.warn('[SECURITY] Query param blocked:', { key, value, ip: req.ip });
      return res.status(400).json({
        success: false,
        error: `Security violation: Invalid characters detected in query parameter '${key}'`,
        code: 'INVALID_QUERY_PARAM'
      });
    }
  }
  
  next();
};


const validateRouteParams = (req, res, next) => {
  if (!req.params || Object.keys(req.params).length === 0) {
    return next();
  }
  
  for (const [key, value] of Object.entries(req.params)) {
    if (typeof value === 'string' && !securityValidators.isSafeQuery(value)) {
      console.warn('[SECURITY] Route param blocked:', { key, value, ip: req.ip });
      return res.status(400).json({
        success: false,
        error: `Security violation: Invalid characters detected in route parameter '${key}'`,
        code: 'INVALID_ROUTE_PARAM'
      });
    }
  }
  
  next();
};


const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }
  
  const bodyString = JSON.stringify(req.body).toLowerCase();
  

  const injectionPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/,
    /javascript:[^'"\s]+/,
    /on\w+\s*=/,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /\$where\s*=/,
    /\$regex\s*=.*?\$where/
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(bodyString)) {
      console.warn('[SECURITY] Injection blocked:', {
        ip: req.ip,
        path: req.path,
        pattern: pattern.source
      });
      
      return res.status(400).json({
        success: false,
        error: 'Security violation: Request contains invalid content',
        code: 'INVALID_CONTENT'
      });
    }
  }
  
  // Allow normal requests
  next();
};


const SAFE_HEADERS = [
  'user-agent', 'accept', 'accept-encoding', 'accept-language',
  'connection', 'host', 'origin', 'referer', 'content-type',
  'content-length', 'cache-control', 'pragma', 
  'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform',
  'upgrade-insecure-requests', 'dnt', 'x-requested-with',
  'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest',
  'sec-fetch-user', 'accept-charset', 'te', 'trailer'
];

const sanitizeHeaders = (req, res, next) => {
  if (!req.headers) return next();
  
  for (const [key, value] of Object.entries(req.headers)) {

    if (SAFE_HEADERS.includes(key.toLowerCase())) {
      continue;
    }
    
    // For other headers, sanitize only if they contain dangerous patterns
    if (typeof value === 'string') {
      const dangerousPattern = /[<>]/; // Only check for XSS patterns
      if (dangerousPattern.test(value)) {
        req.headers[key] = securityValidators.sanitizeInput(value);
      }
    }
  }
  next();
};



const validateHeaders = (req, res, next) => {
  const dangerousPatterns = /[<>'";%()&+\\]/;
  
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-remote-ip', 
    'x-remote-addr',
    'x-original-url',
    'x-http-method-override',
    'x-http-method',
    'x-rewrite-url'
  ];
  
  for (const header of suspiciousHeaders) {
    const value = req.headers[header];
    if (value && typeof value === 'string') {
      // Only check for obvious injection patterns
      if (dangerousPatterns.test(value)) {
        console.warn('[SECURITY] Suspicious header detected:', { 
          header, 
          value: value.substring(0, 100), 
          ip: req.ip,
          path: req.path
        });
        
        // Don't block in development - prevents false positives
        if (process.env.NODE_ENV === 'production') {
          return res.status(400).json({
            success: false,
            error: 'Security violation: Invalid header detected',
            code: 'INVALID_HEADER'
          });
        }
      }
    }
  }
  
  next();
};

const setSecurityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; '));
  
  next();
};


const logSuspiciousActivity = (req, res, next) => {

  const originalEnd = res.end;
  const originalJson = res.json;
  
 
  let wasSuspicious = false;
  
 
  res.json = function(data) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onload=/i,
        /onerror=/i,
        /union select/i,
        /drop table/i,
        /insert into/i,
        /exec xp_/i
      ];
      
      const requestString = JSON.stringify(req.body || {}) + 
                           JSON.stringify(req.query || {}) +
                           JSON.stringify(req.params || {});
      
      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
      
      if (isSuspicious && !wasSuspicious) {
        wasSuspicious = true;
        console.error('[SECURITY ALERT] Potential attack detected:', {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          method: req.method,
          url: req.url,
          userAgent: req.get('user-agent'),
          statusCode: res.statusCode,
          requestBody: JSON.stringify(req.body).substring(0, 500),
          queryParams: req.query
        });
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};


const limitRequestBodySize = (maxSize = '10mb') => {
  return (err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: `Request body too large. Maximum size: ${maxSize}`,
        code: 'PAYLOAD_TOO_LARGE'
      });
    }
    next();
  };
};


const cleanEmptyStrings = (req, res, next) => {
  if (!req.body) return next();
  
  const cleanValue = (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    if (Array.isArray(value)) {
      return value.map(item => cleanValue(item));
    }
    if (value && typeof value === 'object' && value !== null) {
      const cleaned = {};
      for (const [key, val] of Object.entries(value)) {
        cleaned[key] = cleanValue(val);
      }
      return cleaned;
    }
    return value;
  };
  
  req.body = cleanValue(req.body);
  next();
};


const whitelistFields = (allowedFields) => (req, res, next) => {
  if (!req.body) return next();
  
  const filteredBody = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  }
  
  req.body = filteredBody;
  next();
};


const applySecurityMiddleware = (app, options = {}) => {
  const {
    maxBodySize = '10mb',
    enableLogging = true,
    cleanEmptyStrings: shouldCleanEmptyStrings = false
  } = options;
  
  // Body parser limit
  app.use(express.json({ limit: maxBodySize }));
  app.use(express.urlencoded({ extended: true, limit: maxBodySize }));
  app.use(limitRequestBodySize(maxBodySize));
  
  // Security headers (must be first)
  app.use(setSecurityHeaders);
  
  // Sanitization and escaping (order matters)
  app.use(sanitizeHeaders);
  app.use(sanitizeRequestBody);
  app.use(escapeRequestBody);
  
  // Validation
  app.use(validateHeaders);
  app.use(validateQueryParams);
  app.use(validateRouteParams);
  app.use(validateRequestBody);
  
  // Optional cleaning
  if (shouldCleanEmptyStrings) {
    app.use(cleanEmptyStrings);
  }
  
  if (enableLogging) {
    app.use(logSuspiciousActivity);
  }
};

module.exports = {
  sanitizeRequestBody,
  escapeRequestBody,
  validateQueryParams,
  validateRouteParams,
  validateRequestBody,
  sanitizeHeaders,
  validateHeaders,
  setSecurityHeaders,
  logSuspiciousActivity,
  limitRequestBodySize,
  cleanEmptyStrings,
  whitelistFields,
  
  // Combined middleware (recommended)
  applySecurityMiddleware
};