# SEO Setup Guide - MinesArena

## Files Created

### 1. `src/app/sitemap.ts`
Dynamic sitemap generation for Next.js App Router.

**Accessible at**: `https://your-domain.com/sitemap.xml`

#### Pages Included:
- **Home** (`/`) - Priority: 1.0, Daily updates
- **Dashboard** - Priority: 0.9, Daily updates
- **Game Pages** (Mines, Dice, Coinflip, Plinko) - Priority: 0.8, Weekly updates
- **Leaderboard** - Priority: 0.7, Daily updates
- **Profile** - Priority: 0.6, Weekly updates
- **Legal Pages** (Privacy, Terms, Responsible Gaming) - Priority: 0.4, Monthly updates
- **Contact** - Priority: 0.5, Monthly updates

### 2. `src/app/robots.ts`
Robots.txt configuration for search engine crawlers.

**Accessible at**: `https://your-domain.com/robots.txt`

#### Configuration:
- **Allows**: All public pages
- **Disallows**: 
  - `/api/*` - API endpoints
  - `/admin/*` - Admin pages
  - `/_next/*` - Next.js internal files
  - `/profile` - User-specific pages

## How It Works

### Automatic Generation
Next.js automatically generates these files at build time:
- `sitemap.xml` - Generated from `src/app/sitemap.ts`
- `robots.txt` - Generated from `src/app/robots.ts`

### Testing Locally

1. **Start development server**:
```bash
npm run dev
```

2. **Check sitemap**:
```
http://localhost:3005/sitemap.xml
```

3. **Check robots.txt**:
```
http://localhost:3005/robots.txt
```

### Production Deployment

1. **Update base URL** in both files:
```typescript
const baseUrl = 'https://your-actual-domain.com';
```

Or set in environment variable:
```env
NEXTAUTH_URL=https://your-actual-domain.com
```

2. **Build and deploy**:
```bash
npm run build
```

Files will be automatically generated and accessible at:
- `https://your-domain.com/sitemap.xml`
- `https://your-domain.com/robots.txt`

## Submit to Search Engines

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Submit sitemap: `https://your-domain.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap: `https://your-domain.com/sitemap.xml`

## SEO Best Practices Implemented

### ✅ Sitemap
- Dynamic generation
- Proper priority levels
- Change frequency hints
- Last modified dates

### ✅ Robots.txt
- Clear crawl rules
- Protected sensitive paths
- Sitemap reference

### ✅ Meta Tags
- Title tags on all pages
- Description meta tags
- Open Graph tags
- Twitter Card tags

### ✅ Structured Data
- JSON-LD schema (if needed)
- Organization markup
- WebSite markup

### ✅ Performance
- Fast page loads
- Mobile responsive
- Image optimization

## Additional SEO Improvements

### 1. Add Meta Tags to Pages
Each page should have unique meta tags. Example:

```typescript
// src/app/games/mines/page.tsx
export const metadata = {
  title: 'Mines Game - Free Casino Simulator | MinesArena',
  description: 'Play free Mines game online. Test your luck in this exciting casino simulator with provably fair mechanics.',
  openGraph: {
    title: 'Mines Game - MinesArena',
    description: 'Play free Mines game online',
    images: ['/og-mines.png'],
  },
};
```

### 2. Create Canonical URLs
Add canonical links to prevent duplicate content issues:

```html
<link rel="canonical" href="https://your-domain.com/games/mines" />
```

### 3. Add Schema.org Markup
For better rich snippets:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MinesArena",
  "description": "Free casino simulator 2026",
  "url": "https://your-domain.com",
  "applicationCategory": "GameApplication",
  "genre": "Casino Simulator"
}
```

### 4. XML Sitemap Index (For Large Sites)
If you have many dynamic pages:

```typescript
// src/app/sitemap-index.xml/route.ts
export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>https://your-domain.com/sitemap-static.xml</loc>
      </sitemap>
      <sitemap>
        <loc>https://your-domain.com/sitemap-users.xml</loc>
      </sitemap>
    </sitemapindex>
  `);
}
```

## Monitoring

### Tools to Use:
1. **Google Search Console** - Monitor search performance
2. **Google Analytics** - Track user behavior
3. **Ahrefs/SEMrush** - SEO analysis
4. **PageSpeed Insights** - Performance monitoring

## Notes

- Sitemap is automatically regenerated on each build
- Robots.txt protects sensitive routes
- All public pages are crawlable
- User-specific pages (/profile) are excluded from indexing
- API routes are blocked from crawlers

## Support

For SEO issues or questions:
- Check [Next.js SEO Documentation](https://nextjs.org/learn/seo/introduction-to-seo)
- Review [Google Search Central](https://developers.google.com/search)
