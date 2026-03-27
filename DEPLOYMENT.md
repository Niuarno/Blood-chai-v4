# BloodChai - Blood Donation Platform for Bangladesh

A comprehensive blood donation platform designed to connect blood donors with those in need across Bangladesh.

## Features

### For Donors
- Register and create a donor profile
- Set availability status for blood donation
- Receive and manage blood requests
- Track donation history and earn reward points
- Receive notifications about blood needs in your area

### For Recipients
- Search for blood donors by location and blood group
- Send blood requests to specific donors
- Track request status
- Report donors if needed
- Access blood bank information

### For Admins
- Comprehensive dashboard with platform statistics
- User management (donors and recipients)
- Blood request management
- Emergency callout system
- Notice board management
- Payment configuration (bKash, Nagad, Bank)
- Donor report management
- Reward points management

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM (PostgreSQL for production)
- **Authentication**: NextAuth.js
- **Hosting**: Vercel (recommended)
- **Database Hosting**: Supabase

## Deployment Guide

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project credentials from Project Settings > API
3. Get your database connection string from Project Settings > Database > Connection string

### 2. Vercel Deployment

1. Push this code to your GitHub repository
2. Connect the repository to Vercel
3. Set the following environment variables in Vercel:

```
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

4. Replace `prisma/schema.prisma` with `prisma/schema.production.prisma` content
5. Deploy!

### 3. Post-Deployment

1. Visit `https://your-app.vercel.app/api/seed` to create the admin user
2. Login with:
   - Email: `admin@bloodchai.org`
   - Password: `admin123`
3. **Important**: Change the admin password immediately after first login

### 4. Build Commands for Vercel

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Local Development

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Run development server
bun run dev

# Seed database (create admin user)
# Visit http://localhost:3000/api/seed
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   ├── blood-banks/      # Blood banks listing
│   ├── donor/            # Donor dashboard
│   ├── donate/           # Money donation page
│   ├── emergency/        # Emergency blood request
│   ├── find-blood/       # Find blood donors
│   ├── recipient/        # Recipient dashboard
│   └── rulebook/         # Rules and guidelines
├── components/
│   ├── admin/            # Admin components
│   ├── donor/            # Donor components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── recipient/        # Recipient components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions and configurations
```

## Bangladesh Divisions Supported

- Dhaka
- Chittagong
- Rajshahi
- Khulna
- Sylhet
- Barisal
- Rangpur
- Mymensingh

## Blood Groups Supported

- A+
- A-
- B+
- B-
- AB+
- AB-
- O+
- O-

## Payment Methods

- bKash
- Nagad
- Bank Transfer

## License

MIT License - Free to use for non-profit and charitable purposes.

## Support

For support, email: contact@bloodchai.org

---

Made with ❤️ for Bangladesh
