# BloodChai - Blood Donation Platform for Bangladesh

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
1. Extract this ZIP
2. Create new repo in GitHub Desktop: `bloodchai`
3. Copy all files to repo folder
4. Commit and Push

### Step 2: Add Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=[run: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app.vercel.app
```

### Step 3: Deploy
1. Import your GitHub repo in Vercel
2. Click Deploy
3. Wait for build to complete (tables are created automatically)

### Step 4: Seed Database
Visit: `https://your-app.vercel.app/api/seed`

Or use browser console:
```javascript
fetch('/api/seed').then(r=>r.json()).then(console.log)
```

## 🔐 Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@bloodchai.org` |
| Password | `admin123` |

⚠️ Change password after first login!
