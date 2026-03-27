# BloodChai - Blood Donation Platform for Bangladesh

A comprehensive blood donation platform connecting donors with those in need across Bangladesh.

## Features

- **Donor Registration & Dashboard** - Register as a donor, manage availability, view donation history
- **Blood Request System** - Find donors by blood group and location, send requests
- **Admin Dashboard** - Manage users, requests, emergencies, notices, payments, and site settings
- **Blood Bank Listings** - Browse blood banks across Bangladesh with location filtering
- **Payment Donations** - Support the platform via bKash, Nagad, or Bank Transfer
- **Emergency Callouts** - Urgent blood requirements broadcast to all donors
- **Reward Points System** - Earn points for donations

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Supabase recommended for production)
- For local development: SQLite is supported

### Step 1: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 2: Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

**For Local Development (SQLite):**
```env
DATABASE_URL="file:./db/bloodchai.db"
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**For Production (Supabase/PostgreSQL):**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="https://your-domain.com"
```

> **Important:** Generate a secure NEXTAUTH_SECRET:
> ```bash
> openssl rand -base64 32
> ```

### Step 3: Setup Database

This will generate Prisma client, push schema to database, and seed initial data:

```bash
npm run db:setup
```

Or run steps individually:

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data (creates admin user, payment configs, etc.)
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔐 Admin Login Credentials

After running the seed command, use these credentials to login:

```
Email:    admin@bloodchai.org
Password: admin123
```

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

---

## 📁 Project Structure

```
bloodchai/
├── prisma/
│   ├── schema.prisma          # Development schema (SQLite)
│   ├── schema.production.prisma # Production schema (PostgreSQL)
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (main)/           # Main public pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── donor/            # Donor dashboard
│   │   ├── recipient/        # Recipient dashboard
│   │   └── api/              # API routes
│   ├── components/           # React components
│   └── lib/                  # Utilities and configurations
├── public/                   # Static assets
├── .env.example              # Environment template
└── package.json
```

---

## 🌐 Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Connect your repository in Vercel dashboard
3. Set environment variables in Vercel:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Random secret key
   - `NEXTAUTH_URL` - Your production URL

### Production Schema

For production, rename `prisma/schema.production.prisma` to `prisma/schema.prisma` or set:

```bash
DATABASE_URL="your-postgres-url" prisma db push --schema=./prisma/schema.production.prisma
```

---

## 🗄️ Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:seed` | Run seed script |
| `npm run db:setup` | Full setup (generate + push + seed) |
| `npm run db:reset` | Reset database (WARNING: deletes all data) |

---

## 🔧 Troubleshooting

### "Admin login not working"

1. Make sure you've run the seed command:
   ```bash
   npm run db:seed
   ```

2. Check if admin was created successfully - you should see:
   ```
   ✅ Admin user created successfully!
   ═══════════════════════════════════════════
   🔑 ADMIN CREDENTIALS:
   ═══════════════════════════════════════════
      Email:    admin@bloodchai.org
      Password: admin123
   ```

3. If admin exists already, the seed will show:
   ```
   ✅ Admin already exists:
      Email: admin@bloodchai.org
   ```
   Use password: `admin123`

### "Database connection error"

1. Check your `DATABASE_URL` in `.env`
2. For SQLite, ensure the `db/` directory exists
3. For PostgreSQL, verify your connection string and database accessibility

### "Prisma client not found"

Run:
```bash
npm run db:generate
```

---

## 📱 Features Overview

### For Donors
- Register with blood group and location
- Toggle availability status
- View and respond to blood requests
- Track donation history and reward points
- View notices and emergency callouts

### For Recipients
- Search donors by blood group and location
- Send blood requests to specific donors
- Report problematic donors
- View emergency blood availability

### For Admins
- Dashboard with statistics overview
- Manage donors and recipients
- Handle blood requests
- Manage emergency callouts
- Create and manage notices
- Configure payment methods (bKash, Nagad, Bank)
- Update site footer information

---

## 🇧🇩 Bangladesh-Specific Features

- **8 Divisions:** Dhaka, Chittagong, Rajshahi, Khulna, Sylhet, Barisal, Rangpur, Mymensingh
- **64 Districts** supported
- **Local Payment Methods:** bKash, Nagad, Bank Transfer
- **Bengali-friendly interface**

---

## 📄 License

This project is open source and available for community use.

---

## Support

For issues or questions, please open an issue on the repository.
