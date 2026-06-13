# Cloudflare Pages Deployment Guide

## 🚀 Deploy MinesArena to Cloudflare Pages

### Prerequisites
- [x] Cloudflare account (free)
- [x] GitHub account
- [x] Git installed locally
- [x] Code ready to deploy

---

## Step 1: Push Code to GitHub

### Initialize Git (if not already)
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MinesArena Casino Simulator"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Create repository: `minesarena` (or any name)
3. **Don't** initialize with README (you already have code)

### Push to GitHub
```bash
# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/minesarena.git

# Push code
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Cloudflare Pages

### 1. Go to Cloudflare Dashboard
- Visit: https://dash.cloudflare.com/
- Login or Sign up (free)

### 2. Create Pages Project
1. Click **Workers & Pages** in sidebar
2. Click **Create application**
3. Select **Pages** tab
4. Click **Connect to Git**

### 3. Connect GitHub
1. Click **Connect GitHub**
2. Authorize Cloudflare
3. Select your repository: `minesarena`
4. Click **Begin setup**

---

## Step 3: Configure Build Settings

### Build Configuration:
```
Production branch: main
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 18
```

### Environment Variables (Important!):
Click **Environment variables** and add:

```
NODE_VERSION=18
NEXTAUTH_URL=https://your-site.pages.dev (update after first deploy)
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=your-cockroachdb-connection-string
CRON_SECRET=your-cron-secret-key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Note**: Copy `DATABASE_URL` from your `.env` file!

---

## Step 4: Deploy

1. Click **Save and Deploy**
2. Wait 2-3 minutes for build
3. Your site will be live at: `https://your-project.pages.dev`

---

## Step 5: Configure Custom Domain (Optional)

### Add Custom Domain:
1. Go to your Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `minesarena.com` (or your domain)
5. Follow DNS instructions

### Update Environment Variable:
After getting your domain, update:
```
NEXTAUTH_URL=https://minesarena.com
```

Re-deploy to apply changes.

---

## Step 6: Post-Deployment Setup

### 1. Update Sitemap & Robots.txt
Update domain in these files:
- `public/sitemap.xml` - Replace `https://minesarena.com` with your actual domain
- `public/robots.txt` - Update sitemap URL

### 2. Test Your Site
Visit your Cloudflare URL and test:
- [ ] Home page loads
- [ ] All games work
- [ ] Login/Register works
- [ ] Database connection works
- [ ] Google Analytics tracking
- [ ] Mobile responsive

### 3. Setup Cron Jobs
For leaderboard refresh, use:
- **GitHub Actions** (recommended - see CLOUDFLARE_CRON_SETUP.md)
- Or **External cron service** (cron-job.org)

---

## Troubleshooting

### Build Failed?

**Issue**: `Module not found` or `Cannot find module`
**Fix**: Make sure all dependencies in `package.json`
```bash
npm install
npm run build  # Test locally first
```

**Issue**: Environment variables not set
**Fix**: Add all required variables in Cloudflare dashboard

**Issue**: Database connection failed
**Fix**: Check `DATABASE_URL` is correct and database allows connections

### Slow First Load?

This is normal for first visit. Subsequent loads will be cached and instant.

To improve:
1. Enable Cloudflare CDN (automatic)
2. Use Image optimization
3. Enable compression (automatic)

### NextAuth Errors?

**Fix**: Update `NEXTAUTH_URL` to match your actual domain:
```
NEXTAUTH_URL=https://your-actual-domain.pages.dev
```

---

## Performance Optimization

### 1. Enable Cloudflare Features
In Cloudflare Dashboard → Speed:
- [x] Auto Minify (JS, CSS, HTML)
- [x] Brotli compression
- [x] Early Hints
- [x] HTTP/3 (QUIC)
- [x] Rocket Loader™

### 2. Setup Analytics
Already done! Google Analytics will work automatically.

### 3. Enable CDN Caching
Automatic with Cloudflare Pages!

---

## Updating Your Site

### Push Updates:
```bash
# Make changes to code
git add .
git commit -m "Update: description of changes"
git push

# Cloudflare automatically rebuilds and deploys!
```

### Rollback:
1. Go to Pages project
2. Click **Deployments**
3. Find previous working deployment
4. Click **...** → **Rollback to this deployment**

---

## Cloudflare Pages Features

### ✅ Included Free:
- Unlimited bandwidth
- Unlimited requests
- Global CDN (300+ locations)
- Automatic HTTPS
- DDoS protection
- Analytics
- Preview deployments
- Rollback capability
- Custom domains
- 500 builds/month
- Concurrent builds: 1

### 🚀 Performance:
- Edge caching worldwide
- Sub-second response times
- Automatic compression
- HTTP/3 support
- WebP image optimization

---

## Alternative: Deploy via Wrangler CLI

### Install Wrangler:
```bash
npm install -g wrangler
```

### Login:
```bash
wrangler login
```

### Deploy:
```bash
# Build first
npm run build

# Deploy
wrangler pages deploy .next --project-name=minesarena
```

---

## Cost Estimate

### Free Tier (Perfect for your site):
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Builds**: 500/month
- **Custom domains**: Unlimited
- **Team members**: Unlimited

### Paid ($20/month) - Only if needed:
- Priority support
- More concurrent builds
- Advanced analytics

**Your site will run 100% FREE on Cloudflare!** 🎉

---

## Next Steps After Deployment

1. **Submit to Google**:
   - Submit sitemap in Google Search Console
   - URL: `https://your-domain.com/sitemap.xml`

2. **Setup Monitoring**:
   - Cloudflare Analytics (included)
   - Google Analytics (already setup)
   - Uptime monitoring (UptimeRobot free)

3. **Share Your Site**:
   - Update Instagram bio
   - Share on social media
   - Add to portfolio

4. **Regular Updates**:
   - Monitor user feedback
   - Fix bugs
   - Add new games
   - Update content

---

## Support

### Cloudflare Docs:
- https://developers.cloudflare.com/pages/

### Common Issues:
- Build errors: Check build logs in dashboard
- Runtime errors: Check Functions logs
- DNS issues: Wait 24-48 hours for propagation

### Getting Help:
- Cloudflare Community: https://community.cloudflare.com/
- Discord: Your error messages
- Documentation: Always check docs first

---

## Congratulations! 🎉

Your MinesArena casino simulator is now live on Cloudflare's global network!

**Benefits:**
- ⚡ Lightning fast globally
- 🔒 Secure with HTTPS
- 🌍 CDN cached worldwide
- 💰 Zero hosting costs
- 📊 Analytics included
- 🚀 Auto-scaling

Enjoy your blazing-fast casino simulator! 🎰✨
