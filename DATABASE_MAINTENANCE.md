# 🗄️ Database Maintenance Guide

## **⚠️ AUTO-CLEANUP DISABLED**

Auto-cleanup is **turned OFF**. All files are for **reference only**.

---

## **📊 Check Database Size**

### **Method 1: Cloudflare Dashboard** (Easiest)
1. Login: https://dash.cloudflare.com
2. Go to **Workers & Pages** → **D1**
3. Select database: `minesarena-db`
4. Check **Metrics** tab:
   - Total rows
   - Storage used (Free tier: 5 GB)
   - Request count

### **Method 2: CLI Commands**

```bash
# Check database info
wrangler d1 info minesarena-db

# Check table counts
wrangler d1 execute minesarena-db --file=check-db-size.sql
```

---

## **📈 D1 Database Limits**

### **Free Tier:**
- ✅ Storage: **5 GB**
- ✅ Rows read: **5M per day**
- ✅ Rows written: **100K per day**

### **Paid Tier ($5/month):**
- ✅ Storage: **10 GB**
- ✅ Rows read: **25M per day**
- ✅ Rows written: **5M per day**

---

## **🚨 If Database Gets Full (Manual Actions)**

### **Option 1: Manual Cleanup (When YOU Want)**
```bash
# Run cleanup script manually
wrangler d1 execute minesarena-db --file=cleanup-old-data.sql
```

### **Option 2: Call Cleanup API (When YOU Want)**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://minesarena.atsifymail.workers.dev/api/cron/cleanup-database
```

### **Option 3: Upgrade to Paid Plan**
- $5/month for 10 GB storage
- Setup: https://dash.cloudflare.com/billing

---

## **📝 Monitoring (Check Regularly)**

### **Check Usage:**
1. Cloudflare Dashboard → D1 → **minesarena-db**
2. **Metrics** tab
3. Review storage and request usage

### **When to Cleanup:**
- When storage > 4 GB (80% of 5 GB)
- When database starts feeling slow
- When you see performance issues

---

## **Quick Commands**

```bash
# Check DB size
wrangler d1 info minesarena-db

# MANUAL cleanup (only when you want)
wrangler d1 execute minesarena-db --file=cleanup-old-data.sql

# Check logs
wrangler tail minesarena
```

---

## **💡 Files Created (Reference Only)**

1. ✅ `check-db-size.sql` - Check database size
2. ✅ `cleanup-old-data.sql` - Manual cleanup script
3. ✅ `/api/cron/cleanup-database` - Manual cleanup API
4. ⛔ Auto-cleanup: **DISABLED** (won't delete anything automatically)

---

**No automatic deletion will happen. Everything is manual only!** 🛡️
