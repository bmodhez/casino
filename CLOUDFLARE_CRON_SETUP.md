# Cloudflare Cron Jobs Setup Guide

## Overview
This project uses Cloudflare Workers Cron Triggers to automatically refresh the leaderboard cache at 12:00 AM IST daily.

## Cloudflare Cron Options

### Option 1: External Cron Service (Easiest - FREE)
Use a free external service like **cron-job.org** or **EasyCron** to hit your API endpoint.

#### Setup with cron-job.org (100% Free):
1. Go to [cron-job.org](https://cron-job.org) and create free account
2. Create new cron job:
   - **URL**: `https://your-domain.com/api/cron/refresh-leaderboard`
   - **Schedule**: Daily at `00:00` IST (use timezone selector)
   - **HTTP Method**: GET
   - **Headers**: Add `Authorization: Bearer your-cron-secret-key-change-in-production-2024`
3. Save and activate!

**Pros**: 
- ✅ Completely free
- ✅ No coding needed
- ✅ Works with any hosting
- ✅ Easy to setup and manage

**Cons**:
- ❌ Depends on external service
- ❌ Limited to 1 request per minute

### Option 2: Cloudflare Workers (More Complex)
Create a separate Cloudflare Worker with cron triggers.

#### Setup Steps:
1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Create a Worker directory:
```bash
mkdir cloudflare-cron-worker
cd cloudflare-cron-worker
wrangler init
```

3. Edit `wrangler.toml`:
```toml
name = "leaderboard-cron"
main = "src/index.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["30 18 * * *"]  # 6:30 PM UTC = 12:00 AM IST

[vars]
API_URL = "https://your-domain.com"
CRON_SECRET = "your-cron-secret-key-change-in-production-2024"
```

4. Create `src/index.js`:
```javascript
export default {
  async scheduled(event, env, ctx) {
    try {
      const response = await fetch(`${env.API_URL}/api/cron/refresh-leaderboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.CRON_SECRET}`
        }
      });
      
      const data = await response.json();
      console.log('Leaderboard refresh:', data);
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  }
};
```

5. Deploy:
```bash
wrangler deploy
```

**Pros**:
- ✅ Native Cloudflare integration
- ✅ Very reliable
- ✅ Free tier available

**Cons**:
- ❌ More complex setup
- ❌ Requires Cloudflare Workers subscription (free tier has limits)

### Option 3: GitHub Actions (FREE)
Use GitHub Actions as a free cron service.

#### Setup:
1. Create `.github/workflows/cron-leaderboard.yml`:
```yaml
name: Refresh Leaderboard

on:
  schedule:
    # Runs at 6:30 PM UTC (12:00 AM IST) every day
    - cron: '30 18 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  refresh-leaderboard:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cron Endpoint
        run: |
          curl -X GET https://your-domain.com/api/cron/refresh-leaderboard \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. Add `CRON_SECRET` to GitHub Secrets:
   - Go to repository → Settings → Secrets → Actions
   - Add new secret: `CRON_SECRET`

**Pros**:
- ✅ 100% free
- ✅ Reliable (GitHub infrastructure)
- ✅ Easy to setup if using GitHub
- ✅ Can see execution logs

**Cons**:
- ❌ Requires GitHub repository
- ❌ Minimum 5-minute interval

## Recommended Approach

**For your use case, I recommend Option 1 or Option 3:**

### Quick Setup with cron-job.org (5 minutes):
1. Sign up at https://cron-job.org (free)
2. Create cron job with your API URL
3. Set schedule to 12:00 AM IST
4. Add Authorization header
5. Done! ✅

### Or use GitHub Actions (if code is on GitHub):
1. Add the workflow file
2. Add secret to GitHub
3. Push to repository
4. Done! ✅

## Testing the Endpoint

Test locally:
```bash
curl -X GET http://localhost:3005/api/cron/refresh-leaderboard \
  -H "Authorization: Bearer your-cron-secret-key-change-in-production-2024"
```

Test production:
```bash
curl -X GET https://your-domain.com/api/cron/refresh-leaderboard \
  -H "Authorization: Bearer your-cron-secret-key-change-in-production-2024"
```

Expected response:
```json
{
  "success": true,
  "message": "Leaderboard refreshed successfully",
  "count": 100,
  "timestamp": "2024-06-13T18:30:00.000Z"
}
```

## Environment Variables

Make sure to set in Cloudflare Pages:
- `CRON_SECRET` - Your secret key for cron authentication
- `DATABASE_URL` - Your database connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Your production URL

## Schedule Format (Cron Syntax)

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Time Zone Reference:
- **IST** = UTC + 5:30
- **12:00 AM IST** = 6:30 PM UTC (previous day)
- **1:00 AM IST** = 7:30 PM UTC (previous day)

## Alternative: Keep Frontend Auto-Refresh

If you don't want to setup external cron:
- The leaderboard page already has client-side refresh at 12 AM IST
- Works when users have the page open
- Simple but less reliable

## Resources
- [cron-job.org](https://cron-job.org) - Free cron service
- [EasyCron](https://www.easycron.com/) - Alternative free cron
- [GitHub Actions Docs](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cloudflare Workers Cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cron Expression Generator](https://crontab.guru/)
