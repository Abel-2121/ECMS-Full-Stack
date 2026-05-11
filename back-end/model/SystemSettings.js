const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  general: {
    platformName: { type: String, default: 'ECMS - Election Control Management System' },
    platformHeroDescription: { type: String, default: 'ECMS - Election Control Management System' },
    supportEmail: { type: String, default: 'support@ecms.com' },
    supportPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
  },

  hero: {
    title: { type: String, default: 'Election Control & Management System' },
    subtitle: { type: String, default: 'Secure, transparent, and efficient online voting platform for institutions and organizations worldwide.' },
    stats: [
      {
        number: { type: String, default: '500+' },
        label: { type: String, default: 'Organizations' }
      },
      {
        number: { type: String, default: '100K+' },
        label: { type: String, default: 'Voters Served' }
      },
      {
        number: { type: String, default: '99.9%' },
        label: { type: String, default: 'Satisfaction' }
      }
    ],
    images: [
      {
        url: { type: String, default: '' },
        isActive: { type: Boolean, default: false }
      }
    ],
    ctaButtonText: { type: String, default: 'Register Institution' }
  },

  howItWorks: {
    title: { type: String, default: 'How It Works' },
    steps: [
      {
        number: { type: String, default: '01' },
        title: { type: String, default: 'Register' },
        description: { type: String, default: 'Create your account with your email address' },
        icon: { type: String, default: 'FiUserPlus' }
      },
      {
        number: { type: String, default: '02' },
        title: { type: String, default: 'Verify' },
        description: { type: String, default: 'Verify your email with OTP to activate account' },
        icon: { type: String, default: 'FiCheckCircle' }
      },
      {
        number: { type: String, default: '03' },
        title: { type: String, default: 'Participate' },
        description: { type: String, default: 'Vote, manage elections, or run as a candidate' },
        icon: { type: String, default: 'FiAward' }
      }
    ]
  },
  
  about: {
    platformName: { type: String, default: 'ECMS - Election Control & Management System' },
    version: { type: String, default: '2.0.0' },
    description: { type: String, default: '' },
    features: [
      {
        id: { type: Number, default: Date.now },
        title: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ],
    contactEmail: { type: String, default: 'support@ecms.com' },
    website: { type: String, default: 'www.ecms-platform.com' },
    ctaTitle: { type: String, default: 'Ready to get started?' },
    ctaText: { type: String, default: 'Join thousands of institutions already using ECMS for their elections.' },
    ctaButtonText: { type: String, default: 'Create Free Account' },
    contactPhone: { type: String, default: '+1 (555) 123-4567' },
    contactAddress: { type: String, default: '123 Election St, Democracy City, 12345' }
  },
  

  footer: {
    copyright: { type: String, default: '© 2024 ECMS. All rights reserved.' },
    links: [
      { label: { type: String, default: 'Privacy' }, path: { type: String, default: '/privacy' } },
      { label: { type: String, default: 'Terms' }, path: { type: String, default: '/terms' } },
      { label: { type: String, default: 'Contact' }, path: { type: String, default: '/contact' } },
      { label: { type: String, default: 'FAQ' }, path: { type: String, default: '/faq' } }
    ]
  },

  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;