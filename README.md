# BloodChai - Blood Donation Platform for Bangladesh 🇧🇩

## 🚀 Deploy to Vercel (Step by Step)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready (takes ~2 minutes)

### Step 2: Get Database Connection Strings
Go to **Supabase Dashboard → Settings → Database**

You need TWO connection strings:

**A. DATABASE_URL (Pooled - Port 6543)**
1. Scroll to "Connection string" section
2. Select "Transaction pooler" mode
3. Copy the URI - it should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**B. DIRECT_DATABASE_URL (Direct - Port 5432)**
1. Select "Direct connection" mode  
2. Copy the URI - it should look like:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Step 3: Set Environment Variables in Vercel
Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 4 variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your pooled connection (port 6543) |
| `DIRECT_DATABASE_URL` | Your direct connection (port 5432) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` |

### Step 4: Deploy
1. Push code to GitHub
2. Import in Vercel
3. Deploy!

### Step 5: Seed Database
After successful deployment, visit:
```
https://your-app-name.vercel.app/api/seed
```

## 🔐 Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@bloodchai.org` |
| Password | `admin123` |

⚠️ **Change password after first login!**

## 📱 Features

- **Donor Registration** - Register as blood donor with location
- **Find Blood** - Search donors by blood group & location
- **Blood Banks** - List of blood banks across Bangladesh
- **Emergency Requests** - Urgent blood requirement alerts
- **Admin Dashboard** - Full management system
- **Payment Integration** - bKash, Nagad, Bank Transfer

## 🇧🇩 Coverage

- 8 Divisions
- 64 Districts
- Local payment methods
