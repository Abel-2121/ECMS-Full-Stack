
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const SystemSettings = require('./model/SystemSettings');

const migrateSettings = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecms.0fs4jsc.mongodb.net/ECMS?retryWrites=true&w=majority&appName=ECMS`;
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');
    
    const result = await SystemSettings.findOneAndUpdate(
      {}, 
      {
        $set: {
          hero: {
            title: "Election Control & Management System",
            subtitle: "Secure, transparent, and efficient online voting platform for institutions and organizations worldwide.",
            stats: [
              { number: "500+", label: "Organizations" },
              { number: "100K+", label: "Voters Served" },
              { number: "99.9%", label: "Satisfaction" }
            ],
            images: [],
            ctaButtonText: "Register Institution"
          },
          howItWorks: {
            title: "How It Works",
            steps: [
              { number: "01", title: "Register", description: "Create your account with your email address", icon: "FiUserPlus" },
              { number: "02", title: "Verify", description: "Verify your email with OTP to activate account", icon: "FiCheckCircle" },
              { number: "03", title: "Participate", description: "Vote, manage elections, or run as a candidate", icon: "FiAward" }
            ]
          },
          footer: {
            copyright: "© 2024 ECMS. All rights reserved.",
            links: [
              { label: "Privacy", path: "/privacy" },
              { label: "Terms", path: "/terms" },
              { label: "Contact", path: "/contact" },
              { label: "FAQ", path: "/faq" }
            ]
          }
        }
      },
      {
        upsert: true, // Create if doesn't exist
        new: true // Return updated document
      }
    );
    
    console.log('Migration completed successfully!');
    console.log('Settings:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateSettings();