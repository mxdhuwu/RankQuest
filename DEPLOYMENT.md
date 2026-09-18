# RankQuest Production Deployment Guide: Supabase + Vercel

## 1. Push Schema to Supabase
```powershell
npx prisma db push
```

## 2. Seed Clean Questions to Supabase
```powershell
npm run seed
```

## 3. Deploy to Vercel
1. Import `mxdhuwu/RankQuest` on Vercel.
2. Set Environment Variables:
   - `DATABASE_URL` (Port 6543 pooler)
   - `DIRECT_URL` (Port 5432 direct)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_APP_NAME`
3. Click **Deploy**.
