# 📋 Quick GitHub Push Checklist

## Before You Start
- [ ] Git is installed: https://git-scm.com/download/win
- [ ] Git configured: `git config --global user.name "Your Name"`
- [ ] GitHub account created: https://github.com

## Safety Verification (DO THIS FIRST!)
```powershell
cd d:\wanderlust-main

# 1. Initialize git
git init

# 2. CRITICAL: Check what will be committed
git add .
git status

# Verify these DO NOT appear:
# - backend/.env
# - frontend/.env.local
# - node_modules/
# - dist/
# - .DS_Store
```

## Push Steps
```powershell
# 1. Create commit
git commit -m "Initial commit: TravelGo travel blog platform"

# 2. Create repo on GitHub.com (empty, no initial files)
# Copy the HTTPS URL

# 3. Add remote and push
git remote add origin https://github.com/USERNAME/travelgo.git
git branch -M main
git push -u origin main
```

## Verify on GitHub
✅ All source files visible
✅ CONTRIBUTING.md visible
✅ SECURITY.md visible
✅ .env.example files visible
❌ No .env files visible
❌ No node_modules/
❌ No dist/

## If Something Goes Wrong
See `GITHUB_PUSH_GUIDE.md` for detailed troubleshooting

---

**Important:** Never commit .env files! They contain secrets.
