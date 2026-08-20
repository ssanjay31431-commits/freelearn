const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const User = require('./models/User');
const { initialServicesData } = require('./controllers/serviceController');

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vibeforge';
    await mongoose.connect(connStr, {
      dbName: process.env.MONGO_DB_NAME || 'vibeforge',
    });
    console.log('Seeding VibeForge Database...');

    await Service.deleteMany({});
    await Service.insertMany(initialServicesData);
    console.log('✓ Services seeded successfully');

    const superAdminExists = await User.findOne({ email: 'tsomu7036@gmail.com' });
    if (!superAdminExists) {
      await User.create({
        name: 'VibeForge Super Admin',
        email: 'tsomu7036@gmail.com',
        password: 'Kavi@2005',
        phone: '+91 98765 43210',
        role: 'super_admin',
      });
      console.log('✓ Permanent Super Admin user seeded (tsomu7036@gmail.com / Kavi@2005)');
    } else {
      superAdminExists.role = 'super_admin';
      superAdminExists.password = 'Kavi@2005';
      await superAdminExists.save();
      console.log('✓ Permanent Super Admin credentials updated (tsomu7036@gmail.com / Kavi@2005)');
    }

    const adminExists = await User.findOne({ email: 'admin@vibeforge.com' });
    if (!adminExists) {
      await User.create({
        name: 'VibeForge Admin',
        email: 'admin@vibeforge.com',
        password: 'adminpassword123',
        phone: '9876543210',
        role: 'admin',
      });
      console.log('✓ Admin user seeded (admin@vibeforge.com / adminpassword123)');
    }

    const clientExists = await User.findOne({ email: 'client@vibeforge.com' });
    if (!clientExists) {
      await User.create({
        name: 'Demo Client',
        email: 'client@vibeforge.com',
        password: 'clientpassword123',
        phone: '9123456789',
        role: 'client',
      });
      console.log('✓ Client user seeded (client@vibeforge.com / clientpassword123)');
    }

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
