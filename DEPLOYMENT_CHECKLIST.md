# 🚀 Deployment Checklist

## Pre-Deployment (Do these first!)

### Code Preparation
- [ ] All errors fixed
- [ ] Build completes successfully (`npm run build`)
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database connection tested
- [ ] `.env` file NOT committed (in .gitignore)

### Git Setup
```bash
# Check .gitignore includes:
# - node_modules/
# - .env
# - .next/
# - .vercel/

# Commit everything
git add .
git commit -m "Ready for deployment"
```

---

## Deployment Steps (Cloudflare Pages)

### 1. Create GitHub Repository
- [ ] Create repo on GitHub
- [ ] Push code: `git push -u origin main`
- [ ] Verify all files uploaded

### 2. Cloudflare Pages Setup
- [ ] Login to Cloudflare Dashboard
- [ ] Create new Pages project
- [ ] Connect GitHub repository
- [ ] Select `minesarena` repository

### 3. Build Configuration
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 18
```

### 4. Environment Variables (Critical!)
Add these in Cloudflare:
```
NODE_VERSION=18
NEXTAUTH_URL=https://YOUR-SITE.pages.dev
NEXTAUTH_SECRET=your-super-secret-key-change-this
DATABASE_URL=postgresql://...your-cockroachdb-url...
CRON_SECRET=your-cron-secret-key
```

### 5. Deploy
- [ ] Click "Save and Deploy"
- [ ] Wait 2-3 minutes
- [ ] Check build logs for errors
- [ ] Visit your site URL

---

## Post-Deployment Verification

### Essential Checks
- [ ] Homepage loads correctly
- [ ] All games accessible
- [ ] Login/Register works
- [ ] Database connection works
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Google Analytics tracking

### Game Testing
- [ ] Mines game works
- [ ] Dice game works  
- [ ] Coinflip game works
- [ ] Plinko game works
- [ ] Leaderboard shows data
- [ ] Profile page accessible

### Performance
- [ ] First load < 3 seconds
- [ ] Page transitions smooth
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works on different browsers

---

## Configuration Updates

### Update Domain References
After getting your Cloudflare URL:

1. **Update NEXTAUTH_URL**:
   - Go to Cloudflare Pages → Settings → Environment Variables
   - Change `NEXTAUTH_URL` to actual domain
   - Redeploy

2. **Update Sitemap** (`public/sitemap.xml`):
   ```xml
   <loc>https://YOUR-ACTUAL-DOMAIN.pages.dev/...</loc>
   ```

3. **Update Robots.txt** (`public/robots.txt`):
   ```
   Sitemap: https://YOUR-ACTUAL-DOMAIN.pages.dev/sitemap.xml
   ```

4. **Push Changes**:
   ```bash
   git add .
   git commit -m "Update domain URLs"
   git push
   ```

---

## SEO Setup (After Deployment)

### Google Search Console
- [ ] Add property: `https://your-domain.pages.dev`
- [ ] Verify ownership
- [ ] Submit sitemap: `https://your-domain.pages.dev/sitemap.xml`
- [ ] Request indexing for homepage

### Bing Webmaster Tools
- [ ] Add site
- [ ] Verify ownership
- [ ] Submit sitemap
- [ ] Request indexing

### Social Media
- [ ] Update Instagram bio link
- [ ] Share on Twitter/X
- [ ] Share on Discord
- [ ] Share on Reddit (if appropriate)

---

## Monitoring Setup

### Analytics
- [x] Google Analytics (already configured)
- [ ] Cloudflare Web Analytics (optional)
- [ ] Setup goals/conversions

### Uptime Monitoring
- [ ] Setup UptimeRobot (free)
  - Monitor: `https://your-domain.pages.dev`
  - Check every 5 minutes
  - Email alerts

### Error Tracking (Optional)
- [ ] Setup Sentry (free tier)
- [ ] Configure error reporting
- [ ] Test error tracking

---

## Cron Jobs Setup

Since Cloudflare Pages doesn't have built-in cron:

### Option 1: GitHub Actions (Recommended)
```yaml
# .github/workflows/refresh-leaderboard.yml
name: Refresh Leaderboard
on:
  schedule:
    - cron: '30 18 * * *'  # 12:00 AM IST
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron
        run: |
          curl -X GET ${{ secrets.PRODUCTION_URL }}/api/cron/refresh-leaderboard \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 2: cron-job.org
- [ ] Create account
- [ ] Add job: `https://your-domain.pages.dev/api/cron/refresh-leaderboard`
- [ ] Schedule: Daily at 00:00 IST
- [ ] Add header: `Authorization: Bearer your-cron-secret`

---

## Security Checklist

### Environment Variables
- [ ] All secrets in Cloudflare (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database connection secure
- [ ] No API keys exposed in frontend

### Database
- [ ] Connection string secure
- [ ] SSL/TLS enabled
- [ ] Proper access controls
- [ ] Regular backups (CockroachDB handles this)

### Cloudflare Security
- [ ] HTTPS only (automatic)
- [ ] DDoS protection (automatic)
- [ ] Rate limiting (optional)
- [ ] Bot protection (optional)

---

## Performance Optimization

### Cloudflare Settings
- [ ] Auto Minify enabled (JS, CSS, HTML)
- [ ] Brotli compression enabled
- [ ] HTTP/3 enabled
- [ ] Early Hints enabled

### Next.js Optimizations
- [x] Image optimization configured
- [x] Code splitting enabled
- [x] Static generation where possible
- [x] API routes optimized

### CDN Caching
- [ ] Static assets cached (automatic)
- [ ] API responses cached (where appropriate)
- [ ] Images cached globally

---

## Backup & Recovery

### Code Backup
- [x] Code on GitHub (version controlled)
- [ ] Regular commits
- [ ] Tagged releases for major updates

### Database Backup
- [x] CockroachDB automatic backups
- [ ] Document restore process
- [ ] Test restore procedure

### Rollback Plan
- [ ] Know how to rollback in Cloudflare
- [ ] Keep previous working commit tagged
- [ ] Document rollback steps

---

## Custom Domain Setup (Optional)

### If Using Custom Domain:
1. **Buy Domain** (Namecheap, GoDaddy, Cloudflare)

2. **Add to Cloudflare**:
   - Pages project → Custom domains
   - Add: `minesarena.com` and `www.minesarena.com`

3. **Update DNS**:
   - Add CNAME records as instructed
   - Wait 24-48 hours for propagation

4. **Update Environment Variables**:
   ```
   NEXTAUTH_URL=https://minesarena.com
   ```

5. **Update Code**:
   - Sitemap URLs
   - Robots.txt
   - Any hardcoded domains

---

## Launch Day Checklist

### Final Checks
- [ ] All features working
- [ ] Mobile experience perfect
- [ ] Loading times acceptable
- [ ] No console errors
- [ ] Analytics tracking
- [ ] Sitemap submitted

### Announcement
- [ ] Social media posts ready
- [ ] Screenshots/videos prepared
- [ ] Launch announcement written
- [ ] Community notified

### Monitoring
- [ ] Uptime monitoring active
- [ ] Error tracking configured
- [ ] Analytics dashboard open
- [ ] Ready to respond to issues

---

## Post-Launch (First Week)

### Daily Checks
- [ ] Monitor uptime
- [ ] Check error logs
- [ ] Review analytics
- [ ] Respond to user feedback
- [ ] Fix any bugs

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check SEO indexing status
- [ ] Update content if needed
- [ ] Plan improvements

---

## Maintenance Schedule

### Weekly
- Review analytics
- Check error logs
- Monitor uptime
- Respond to issues

### Monthly
- Update dependencies
- Security audit
- Performance review
- Backup verification

### Quarterly
- Major updates/features
- SEO review
- User feedback analysis
- Infrastructure review

---

## Emergency Contacts

### Service Status Pages
- Cloudflare: https://www.cloudflarestatus.com/
- GitHub: https://www.githubstatus.com/
- CockroachDB: https://status.cockroachlabs.com/

### Support
- Cloudflare Community: https://community.cloudflare.com/
- Next.js Discord: https://nextjs.org/discord
- GitHub Support: https://support.github.com/

---

## Success Metrics

### Track These:
- Daily active users
- Page load times
- Game plays per day
- User registrations
- Bounce rate
- Average session duration

### Goals (First Month):
- [ ] 100+ total users
- [ ] < 2s average load time
- [ ] 95%+ uptime
- [ ] 1000+ game plays
- [ ] Positive user feedback

---

## 🎉 You're Ready to Deploy!

Follow this checklist step-by-step and your site will be live, fast, and reliable!

Good luck! 🚀✨
