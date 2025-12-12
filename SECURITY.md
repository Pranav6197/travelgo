# 🔒 TravelGo - Security & Environment Variables

## What NOT to Commit

This project uses environment variables to protect sensitive data. The following are **never** committed to the repository:

- ✅ Ignored: `.env` and `.env.*.local` files
- ✅ Ignored: `node_modules/` directories  
- ✅ Ignored: Build artifacts and logs

## Setting Up Your Local Environment

### Quick Start
Run the setup script (Windows):
```bash
setup.bat
```

Or manually:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Required Credentials

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `MONGODB_URI` | Database connection | MongoDB Atlas |
| `REDIS_URL` | Cache server | Redis Cloud or local |
| `JWT_SECRET` | Token signing | Generate: `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | OAuth provider | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth provider | Google Cloud Console |
| `CLOUDINARY_URL` | Image storage | Cloudinary Dashboard |
| `VITE_API_PATH` | API endpoint (frontend) | Your backend URL |

## Verification Checklist

Before pushing to GitHub:

- [ ] `.env` and `.env.local` files are in `.gitignore`
- [ ] `.env.example` files are committed (templates only, no real values)
- [ ] No credentials appear in any JavaScript/JSON files
- [ ] Run `git status` to verify no `.env` files are staged
- [ ] `.gitignore` is properly configured

## If You Accidentally Commit Secrets

Immediately:
1. Rotate all credentials
2. Remove the commit from history:
   ```bash
   git reset HEAD~1  # Undo last commit
   git rm --cached backend/.env frontend/.env.local
   git commit --amend -m "Remove .env files"
   ```
3. Force push only if you own the repo and no one has pulled:
   ```bash
   git push --force-with-lease
   ```

## Deployment

For production deployment:
- Set environment variables through your hosting platform (Vercel, Heroku, Azure, etc.)
- Never commit production `.env` files
- Use different values for development vs production
