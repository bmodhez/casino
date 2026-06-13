# Mobile Testing Guide - Port Forwarding

## Quick Steps to Test on Mobile

### Method 1: Local Network (Easiest) ✅

#### Step 1: Find Your PC's IP
Open **Command Prompt** or **PowerShell**:
```bash
ipconfig
```

Look for your **IPv4 Address** under your active connection:
- **WiFi**: Look under "Wireless LAN adapter Wi-Fi"
- **Ethernet**: Look under "Ethernet adapter"

Example output:
```
IPv4 Address: 192.168.1.100
```

#### Step 2: Start Dev Server for Network Access
```bash
npm run dev -- --hostname 0.0.0.0
```

Or temporarily update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0 --port 3005"
  }
}
```

#### Step 3: Access from Mobile
1. Connect mobile to **same WiFi** as PC
2. Open mobile browser
3. Navigate to: `http://YOUR_PC_IP:3005`
   - Example: `http://192.168.1.100:3005`

#### Step 4: Allow Firewall (If Needed)
If can't access, allow port in Windows Firewall:

**PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
```

Or manually:
1. Search "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Port → TCP → 3005 → Allow
5. Apply to all profiles

---

### Method 2: Using ngrok (Internet Access) 🌐

#### Step 1: Install ngrok
Download from: https://ngrok.com/download

Or via npm:
```bash
npm install -g ngrok
```

Or via Chocolatey:
```bash
choco install ngrok
```

#### Step 2: Start Your Dev Server
```bash
npm run dev
```

#### Step 3: Open New Terminal and Run ngrok
```bash
ngrok http 3005
```

#### Step 4: Copy the URL
You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3005
```

Use `https://abc123.ngrok.io` on mobile or any device!

**Benefits:**
- ✅ Works from anywhere (not just local network)
- ✅ HTTPS by default
- ✅ Can share with others
- ✅ No firewall issues

---

### Method 3: Cloudflare Tunnel (Free Alternative)

#### Step 1: Install cloudflared
Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

#### Step 2: Start Tunnel
```bash
cloudflared tunnel --url http://localhost:3005
```

You'll get a URL like: `https://xyz.trycloudflare.com`

---

## Troubleshooting

### ❌ Can't Connect on Local Network

**Issue 1: Firewall Blocking**
```powershell
# Check firewall rules
Get-NetFirewallRule -DisplayName "*Next.js*"

# Temporarily disable firewall (NOT RECOMMENDED for production)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**Issue 2: Wrong IP Address**
- Make sure using IPv4, not IPv6
- Use IP from active network adapter
- Both devices on same WiFi/network

**Issue 3: Server Not Binding to 0.0.0.0**
Check if server started with `--hostname 0.0.0.0`:
```bash
npm run dev -- --hostname 0.0.0.0
```

### ❌ ngrok Issues

**Issue: Auth Required**
```bash
# Sign up at ngrok.com and get auth token
ngrok authtoken YOUR_AUTH_TOKEN
```

**Issue: Connection Refused**
- Make sure dev server is running first
- Check port number matches (3005)

---

## Network Commands Reference

### Find IP Address
```bash
# Windows - IPv4 only
ipconfig | findstr IPv4

# Windows - Detailed
ipconfig /all

# Check network connectivity
ping 192.168.1.1
```

### Check Port
```bash
# Check if port is listening
netstat -an | findstr 3005

# Kill process on port (if needed)
netstat -ano | findstr 3005
# Note the PID, then:
taskkill /PID <PID> /F
```

### Test Connection
```bash
# From PC, test if server accessible
curl http://localhost:3005

# From another device on network
curl http://YOUR_PC_IP:3005
```

---

## Mobile Testing Checklist

- [ ] Dev server running
- [ ] Server bound to 0.0.0.0
- [ ] Firewall allows port 3005
- [ ] Mobile on same WiFi
- [ ] Using correct IP address
- [ ] Port 3005 included in URL
- [ ] No VPN interfering

---

## Quick Fix Commands

### If npm install hangs:
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm install --registry=https://registry.npmjs.org/

# Or skip post-install scripts
npm install --ignore-scripts
```

### If build fails:
```bash
# Clean everything
rm -rf node_modules package-lock.json .next

# Fresh install
npm install

# Start fresh dev server
npm run dev
```

---

## Alternative: Use Existing Dev Server

If npm install is hanging, and dev server already running:

1. **Don't stop** current dev server
2. Open new terminal
3. Find your IP: `ipconfig`
4. Access from mobile: `http://YOUR_IP:3005`

Current running server will work on network if you:
1. Allow firewall (see above)
2. Or temporarily disable firewall
3. Or use ngrok/cloudflare tunnel

---

## Recommended Approach

**For Quick Testing:**
1. Get your IP: `ipconfig`
2. Use ngrok: `ngrok http 3005`
3. Access ngrok URL from mobile

**For Regular Development:**
1. Update `package.json` with `--hostname 0.0.0.0`
2. Add firewall rule once
3. Use local IP from any device

Happy Testing! 📱✨
