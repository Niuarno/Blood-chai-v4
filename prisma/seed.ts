import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('\n📌 Use password: admin123 (or the password you set)');
      return;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@bloodchai.org',
        password: hashedPassword,
        name: 'Admin',
        phone: '+880 1234-567890',
        role: 'admin',
      },
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('🔑 ADMIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════');
    console.log('   Email:    admin@bloodchai.org');
    console.log('   Password: admin123');
    console.log('═══════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    // Create payment configurations
    const existingPayments = await prisma.paymentConfig.findFirst();
    if (!existingPayments) {
      console.log('💳 Setting up payment configurations...');
      await prisma.paymentConfig.createMany({
        data: [
          {
            method: 'bkash',
            accountName: 'BloodChai Foundation',
            accountNumber: '01712345678',
            instructions: `1. Open your bKash app
2. Select 'Send Money'
3. Enter the number: 01712345678
4. Enter the amount
5. Add reference: 'Donation'
6. Confirm with your PIN`,
          },
          {
            method: 'nagad',
            accountName: 'BloodChai Foundation',
            accountNumber: '01812345678',
            instructions: `1. Open your Nagad app
2. Select 'Send Money'
3. Enter the number: 01812345678
4. Enter the amount
5. Add reference: 'Donation'
6. Confirm with your PIN`,
          },
          {
            method: 'bank',
            accountName: 'BloodChai Foundation',
            accountNumber: '1234567890',
            instructions: `Bank Name: Dutch Bangla Bank
Branch: Dhanmondi, Dhaka
Account Type: Savings

For international transfers:
SWIFT Code: DBBLBDDH
Routing Number: 123456789`,
          },
        ],
      });
      console.log('✅ Payment configurations created\n');
    }

    // Create site configuration for footer
    const existingSiteConfig = await prisma.siteConfig.findFirst();
    if (!existingSiteConfig) {
      console.log('⚙️  Setting up site configuration...');
      await prisma.siteConfig.createMany({
        data: [
          {
            key: 'footer',
            value: JSON.stringify({
              description: 'A life-saving blood donation platform dedicated to connecting donors with those in need across Bangladesh.',
              facebook: 'https://facebook.com/bloodchai',
              twitter: 'https://twitter.com/bloodchai',
              instagram: 'https://instagram.com/bloodchai',
              address: 'Dhaka, Bangladesh',
              phone: '+880 1234-567890',
              email: 'contact@bloodchai.org',
            }),
          },
          {
            key: 'contact',
            value: JSON.stringify({
              address: 'Dhaka, Bangladesh',
              phone: '+880 1234-567890',
              email: 'contact@bloodchai.org',
              emergencyPhone: '+880 1987-654321',
            }),
          },
        ],
      });
      console.log('✅ Site configuration created\n');
    }

    // Create sample blood banks
    const existingBanks = await prisma.bloodBank.findFirst();
    if (!existingBanks) {
      console.log('🏥 Adding sample blood banks...');
      await prisma.bloodBank.createMany({
        data: [
          {
            name: 'Bangladesh Red Crescent Society Blood Center',
            division: 'Dhaka',
            district: 'Dhaka',
            address: 'Bara Maghbazar, Dhaka-1217',
            phone: '+880 2-9341234',
            email: 'info@redcrescent.org',
            operatingHours: 'Sat-Thu: 9AM-5PM, Fri: Closed',
            services: JSON.stringify(['Whole Blood', 'Platelets', 'Plasma', 'Cryo']),
            mapUrl: 'https://maps.google.com/?q=Red+Crescent+Dhaka',
          },
          {
            name: 'Dhaka Medical College Blood Bank',
            division: 'Dhaka',
            district: 'Dhaka',
            address: 'Shahbag, Dhaka-1000',
            phone: '+880 2-9661051',
            operatingHours: '24/7 Emergency Service',
            services: JSON.stringify(['Whole Blood', 'Platelets', 'Emergency Blood']),
            mapUrl: 'https://maps.google.com/?q=Dhaka+Medical+College',
          },
          {
            name: 'Square Hospital Blood Bank',
            division: 'Dhaka',
            district: 'Dhaka',
            address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka-1205',
            phone: '+880 2-8159457',
            email: 'bloodbank@squarehospital.com',
            operatingHours: '24/7',
            services: JSON.stringify(['Whole Blood', 'Platelets', 'Plasma', 'Component Therapy']),
            mapUrl: 'https://maps.google.com/?q=Square+Hospital+Dhaka',
          },
          {
            name: 'Chittagong Medical College Blood Bank',
            division: 'Chittagong',
            district: 'Chittagong',
            address: 'Agrabad, Chittagong',
            phone: '+880 31-2541234',
            operatingHours: 'Sat-Thu: 8AM-8PM, Emergency: 24/7',
            services: JSON.stringify(['Whole Blood', 'Platelets']),
            mapUrl: 'https://maps.google.com/?q=Chittagong+Medical+College',
          },
          {
            name: 'Sylhet MAG Osmani Medical College Blood Bank',
            division: 'Sylhet',
            district: 'Sylhet',
            address: 'Medical College Road, Sylhet',
            phone: '+880 821-712345',
            operatingHours: 'Sat-Thu: 9AM-5PM',
            services: JSON.stringify(['Whole Blood', 'Emergency Blood']),
            mapUrl: 'https://maps.google.com/?q=Sylhet+Medical+College',
          },
        ],
      });
      console.log('✅ Sample blood banks added\n');
    }

    console.log('═══════════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
