// models/RateLimit.js
const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  points: {
    type: Number,
    default: 0
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } 
  },
  
  metadata: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    endpoint: String,
    ip: String,
    userAgent: String
  },
  
  isLocked: {
    type: Boolean,
    default: false
  },
  
  lockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for faster queries
rateLimitSchema.index({ key: 1, expiresAt: 1 });
rateLimitSchema.index({ 'metadata.userId': 1 });
rateLimitSchema.index({ 'metadata.ip': 1 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);