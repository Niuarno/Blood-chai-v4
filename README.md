# BloodChai - Blood Donation Platform 🇧🇩

## Quick Deploy to Vercel

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Wait ~2 minutes for setup

### 2. Get Database URL
- Go to **Settings → Database**
- Copy the **Connection string** (URI format)
- Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Set Vercel Environment Variables
Add these 3 variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### 4. Deploy!
Push to GitHub → Import in Vercel → Deploy

### 5. Seed Database
Visit: `https://your-app.vercel.app/api/seed`

## Admin Login
- **Email:** admin@bloodchai.org
- **Password:** admin123

⚠️ Change password after first login!
