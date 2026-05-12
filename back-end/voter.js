const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./model/userModel');

const voters = [
  {
    firstName: 'Abebe',
    lastName: 'Kebede',
    email: 'abebekebede@gmail.com',
    phone: '+251911234567',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Almaz',
    lastName: 'Bekele',
    email: 'almazbekele@gmail.com',
    phone: '+251912345678',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Dawit',
    lastName: 'Mekonnen',
    email: 'dawitmekonnen@gmail.com',
    phone: '+251913456789',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Tigist',
    lastName: 'Solomon',
    email: 'tigistsolomon@gmail.com',
    phone: '+251914567890',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Biruk',
    lastName: 'Tadesse',
    email: 'biruktadesse@gmail.com',
    phone: '+251915678901',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Meron',
    lastName: 'Assefa',
    email: 'meronassefa@gmail.com',
    phone: '+251916789012',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Henok',
    lastName: 'Getachew',
    email: 'henokgetachew@gmail.com',
    phone: '+251917890123',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Selam',
    lastName: 'Tesfaye',
    email: 'selamtesfaye@gmail.com',
    phone: '+251918901234',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Nahom',
    lastName: 'Haile',
    email: 'nahomhaile@gmail.com',
    phone: '+251919012345',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Eden',
    lastName: 'Girma',
    email: 'edengirma@gmail.com',
    phone: '+251910123456',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Yonas',
    lastName: 'Desta',
    email: 'yonasdesta@gmail.com',
    phone: '+251921234567',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  },
  {
    firstName: 'Hanna',
    lastName: 'Alemayehu',
    email: 'hannaalemayehu@gmail.com',
    phone: '+251922345678',
    password: 'Voter@123',
    passwordConfirm: 'Voter@123',
    role: 'voter',
    address: 'Addis Ababa, Ethiopia',
    isActive: true,
    emailVerified: true,
    photo: 'default.jpg'
  }
];

// Function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Main migration function
const seedVoters = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecms.0fs4jsc.mongodb.net/ECMS?retryWrites=true&w=majority&appName=ECMS`;
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    // Check if voters already exist
    const existingVoters = await User.find({ role: 'voter' });
    if (existingVoters.length > 0) {
      console.log(`⚠️ Found ${existingVoters.length} existing voters. Skipping seed.`);
      console.log('To reseed, delete existing voters first.');
      process.exit(0);
    }

    // Hash passwords for each voter
    const votersWithHashedPasswords = await Promise.all(
      voters.map(async (voter) => {
        const hashedPassword = await hashPassword(voter.password);
        return {
          ...voter,
          password: hashedPassword,
          passwordConfirm: undefined // Remove passwordConfirm before saving
        };
      })
    );

    // Insert voters
    const insertedVoters = await User.insertMany(votersWithHashedPasswords);
    
    console.log(`✅ Successfully inserted ${insertedVoters.length} voters`);
    console.log('\n📋 Voter Credentials:');
    console.log('='.repeat(50));
    
    insertedVoters.forEach((voter, index) => {
      console.log(`\n${index + 1}. ${voter.firstName} ${voter.lastName}`);
      console.log(`   Email: ${voter.email}`);
      console.log(`   Password: Voter@123`);
      console.log(`   Phone: ${voter.phone}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding voters:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration
seedVoters();