# Rinx Hockey Club — AEM Edge Delivery Site

**Live URL:** `https://main--rinxhockeyclub--jgrosskurth.aem.page`  
**DA Authoring:** `https://da.live/#/jgrosskurth/rinxhockeyclub`

## Setup Steps

### 1. Install AEM Code Sync GitHub App
Visit: https://github.com/apps/aem-code-sync/installations/new  
Select **Only select repositories** → choose `rinxhockeyclub` → Save.

### 2. Verify the site is live
Once Code Sync is installed your site is instantly available at:
```
https://main--rinxhockeyclub--jgrosskurth.aem.page
```

### 3. Author content in da.live
Go to https://da.live/#/jgrosskurth/rinxhockeyclub  
You'll see all your pages (index, roster, schedule, stats, etc.).  
Edit any page, hit **Preview**, then **Publish**.

### 4. Local development (optional)
```bash
npm install -g @adobe/aem-cli
git clone https://github.com/Jgrosskurth/rinxhockeyclub
cd rinxhockeyclub
aem up
```
Opens http://localhost:3000/

## Site Pages

| URL | File | Description |
|-----|------|-------------|
| / | index.md | Homepage with hero, news, recent results, about |
| /roster | roster.md | Full player roster + coaching staff |
| /schedule | schedule.md | 2024–25 season results |
| /stats | stats.md | Player stats from rinxstats.csv |
| /tournaments | tournaments.md | Tournament schedule |
| /sponsors | sponsors.md | Sponsorship tiers + request form |
| /clinics | clinics.md | Clinic schedule + private session form |
| /contact | contact.md | Contact form |

## Updating Stats
Replace `rinxstats.csv` in this repo. The stats page fetches it live on every visit.

## Updating the Logo
Replace `icons/rinxlogo.png` in this repo.
