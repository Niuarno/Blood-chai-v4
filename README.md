# BloodChai - Blood Donation Platform

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub
1. Extract this ZIP
2. Create new repo in GitHub Desktop
3. Copy all files to repo folder
4. Commit and Push

### Step 2: Deploy on Vercel
1. Go to vercel.com
2. Import your GitHub repo
3. Add environment variables (see below)
4. Click Deploy

### Step 3: Seed Database
After deploy, visit: `https://your-app.vercel.app/api/seed`

## ⚙️ Environment Variables

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-32-char-string
NEXTAUTH_URL=https://your-app.vercel.app
```

## 🔐 Admin Login

- **Email:** admin@bloodchai.org
- **Password:** admin123

## 🌱 Seed via Browser Console

```javascript
fetch('/api/seed').then(r=>r.json()).then(console.log)
```
