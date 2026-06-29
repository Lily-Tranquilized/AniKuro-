# AniKuro Backend - Deployment Guide

## 🚀 Deployment Instructions

### Option 1: Deploy on Vercel (Recommended for Frontend)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Connect Repository**
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js/Node.js

3. **Configure Environment**
   - Add environment variables in Vercel dashboard
   - PORT, NODE_ENV, etc.

4. **Deploy**
   - Click "Deploy"
   - Your site goes live immediately

### Option 2: Deploy on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repo

3. **Configure Build**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

4. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys on every push

### Option 3: Deploy on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Add variables: PORT, NODE_ENV
   - Railway auto-detects package.json

4. **Deploy**
   - Click "Deploy"
   - Your app goes live in minutes

### Option 4: Deploy on Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create anikuro-app
   ```

4. **Add Procfile** (create file named `Procfile`)
   ```
   web: npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 5: Deploy on AWS Lambda + API Gateway

1. **Create AWS Account**
   - Go to [aws.amazon.com](https://aws.amazon.com)

2. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

3. **Configure Serverless**
   ```bash
   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
   ```

4. **Deploy**
   ```bash
   serverless deploy
   ```

## 📋 Pre-Deployment Checklist

- [ ] All dependencies in `package.json`
- [ ] Environment variables configured
- [ ] `.env` file not committed to git
- [ ] `server.js` file is production-ready
- [ ] Error handling implemented
- [ ] CORS configured for your frontend domain
- [ ] Database connection string set
- [ ] Node version >= 18

## 🔐 Production Security Checklist

- [ ] Hash all passwords with bcrypt
- [ ] Enable HTTPS/SSL certificates
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up logging and monitoring
- [ ] Enable CORS only for known domains
- [ ] Use JWT tokens with expiration
- [ ] Implement CSRF protection
- [ ] Regular security audits

## 📊 Environment Variables

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your_super_secret_key
MONGODB_URI=your_mongodb_connection_string
```

## 🐛 Troubleshooting

### App Won't Start
- Check Node version: `node --version` (should be 18+)
- Verify all dependencies: `npm install`
- Check for syntax errors: `node server.js`

### Connection Issues
- Verify CORS settings
- Check firewall/port access
- Test API with Postman

### Database Connection Failed
- Verify connection string format
- Check database service is running
- Test connection locally first

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify all environment variables
4. Test locally before deploying

---

Happy deploying! 🚀
