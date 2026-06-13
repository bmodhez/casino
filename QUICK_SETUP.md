# Quick Cron Setup for Cloudflare Deployment

## ✅ Recommended: GitHub Actions (100% FREE)

Since your code will be on GitHub, this is the easiest option!

### Setup Steps (5 minutes):

#### 1. Add Secrets to GitHub Repository
Go to your GitHub repository:
- Navigate to **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Add these two secrets:

**Secret 1:**
- Name: `CRON_SECRET`
- Value: `your-cron-secret-key-change-in-production-2024`

**Secret 2:**
- Name: `PRODUCTION_URL`
- Value: Your production URL (e.g., `https://your-site.pages.dev`)

#### 2. Push Code to GitHub
The workflow file is already created at `.github/workflows/cron-leaderboard.yml`

```bash
git add .
git commit -m "Add automatic leaderboard refresh cron"
git push
```

#### 3. Verify Setup
1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see "Refresh Leaderboard Cache" workflow
4. Click on it → **Run workflow** to test manually
5. Check if it runs successfully ✅

#### 4. Set CRON_SECRET in Cloudflare Pages
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Click **Settings** → **Environment Variables**
3. Add variable:
   - Variable name: `CRON_SECRET`
   - Value: `your-cron-secret-key-change-in-production-2024`
   - Environment: Production

### How It Works:
- Every day at **12:00 AM IST**, GitHub Actions automatically runs
- It calls your API endpoint: `/api/cron/refresh-leaderboard`
- Leaderboard cache updates with top 100 players
- All users see fresh data!

---

## Alternative: cron-job.org (No GitHub needed)

If you prefer not using GitHub Actions:

1. Go to [cron-job.org](https://cron-job.org) and create free account
2. Create new cron job:
   - **Title**: Leaderboard Refresh
   - **URL**: `https://your-domain.pages.dev/api/cron/refresh-leaderboard`
   - **Schedule**: Every day at `00:00` (select IST timezone)
   - **Execution**: Enable
3. Click **Advanced** → Add **Header**:
   - Key: `Authorization`
   - Value: `Bearer your-cron-secret-key-change-in-production-2024`
4. Save and you're done! ✅

---

## Testing

### Test Locally:
```bash
curl http://localhost:3005/api/cron/refresh-leaderboard -H "Authorization: Bearer your-cron-secret-key-change-in-production-2024"
```

### Test Production (after deployment):
```bash
curl https://your-site.pages.dev/api/cron/refresh-leaderboard -H "Authorization: Bearer your-cron-secret-key-change-in-production-2024"
```

### Expected Response:
```json
{
  "success": true,
  "message": "Leaderboard refreshed successfully",
  "count": 100,
  "timestamp": "2024-06-13T18:30:00.000Z"
}
```

---

## What Gets Deployed:

✅ **API Endpoint**: `/api/cron/refresh-leaderboard` - Already created  
✅ **GitHub Workflow**: `.github/workflows/cron-leaderboard.yml` - Already created  
✅ **Environment Variables**: Need to set in Cloudflare + GitHub  
✅ **Cache File**: `.leaderboard-cache.json` - Auto-generated  

---

## Troubleshooting

### Cron not running?
- Check GitHub Actions logs
- Verify secrets are set correctly
- Test endpoint manually with curl

### 401 Unauthorized error?
- Make sure `CRON_SECRET` matches in `.env` and GitHub/cron-job.org
- Check Authorization header format

### Database connection error?
- Verify `DATABASE_URL` is set in Cloudflare Pages environment variables

---

## Cost: **FREE!** 🎉

Both GitHub Actions and cron-job.org are completely free for this use case.
