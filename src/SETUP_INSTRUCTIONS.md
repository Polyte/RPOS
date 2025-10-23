# Roxton POS Pro - Local Development Setup

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0.0 or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`
- **npm**: Version 8.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`
- **Git**: For version control
  - Download from: https://git-scm.com/
  - Verify: `git --version`

### Recommended Tools
- **VS Code**: For optimal development experience
  - Download from: https://code.visualstudio.com/
- **Chrome/Edge**: For best debugging experience

## 📦 Installation Steps

### 1. Install Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages including:
- React 18 with TypeScript
- Tailwind CSS v4
- Supabase client
- UI components (Shadcn/UI)
- Development tools

### 2. Environment Configuration

#### Option A: Basic Setup (Demo Mode)
Copy the local environment file:
```bash
cp .env.local .env
```

This provides demo configuration that works without external services.

#### Option B: Full Supabase Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Sign up for Supabase (if you haven't already):
   - Go to: https://supabase.com/
   - Create a new project
   - Get your project URL and API keys

3. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### 3. Start Development Server

Run the development server:
```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000 (for testing on other devices)

## 🚀 Available Commands

### Development
```bash
npm run dev              # Start development server
npm run type-check       # Run TypeScript type checking
npm run lint            # Run ESLint linting
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

### Build & Deploy
```bash
npm run build           # Build for production
npm run preview         # Preview production build
npm run clean          # Clean cache and node_modules
```

### Supabase (Optional)
```bash
npm run supabase:start  # Start local Supabase instance
npm run supabase:stop   # Stop local Supabase instance
npm run supabase:status # Check Supabase status
npm run supabase:reset  # Reset local database
```

## 🎯 First Run Experience

### What to Expect
1. **Loading Screen**: Initial system initialization
2. **Login Screen**: Role selection interface
3. **Main Interface**: Role-specific dashboard

### Available Roles
- **Cashier**: Point of sale operations
- **Admin**: System management and configuration
- **Manager**: Business analytics and reporting
- **Stock**: Inventory management

### Demo Data
The system includes sample data for testing:
- Demo products and inventory
- Mock transaction history
- Sample analytics data
- Test user accounts

## 🔧 Development Environment Setup

### VS Code Configuration
If using VS Code, the project includes optimal settings:

1. **Extensions**: Install recommended extensions
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "@recommended"
   - Install all recommended extensions

2. **Settings**: Pre-configured for optimal development
   - Automatic formatting on save
   - ESLint integration
   - TypeScript error checking
   - Tailwind CSS IntelliSense

### Browser Setup
For best development experience:
1. **Chrome DevTools**: React Developer Tools extension
2. **Redux DevTools**: For state debugging (if needed)
3. **React Developer Tools**: Component inspection

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
Error: Port 3000 is already in use
```
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- --port 3001
```

#### 2. Node Modules Issues
```bash
Error: Cannot find module...
```
**Solution:**
```bash
# Clear cache and reinstall
npm run clean
npm install
```

#### 3. TypeScript Errors
```bash
TypeScript error in...
```
**Solution:**
```bash
# Run type checking
npm run type-check
# Clean TypeScript cache
rm -rf node_modules/.cache
npm run dev
```

#### 4. Build Failures
```bash
Build failed with errors
```
**Solution:**
```bash
# Check for errors
npm run lint
npm run type-check
# Clean and rebuild
rm -rf dist
npm run build
```

#### 5. Supabase Connection Issues
```bash
Failed to connect to Supabase
```
**Solutions:**
- Verify environment variables in `.env`
- Check Supabase project status
- Use demo mode: copy `.env.local` to `.env`

### Performance Issues

#### Slow Development Server
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Environment-Specific Issues

#### Windows Users
```bash
# Use cross-env for environment variables
npm install -g cross-env
```

#### macOS/Linux Permissions
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## 📱 Mobile Development

### Testing on Mobile Devices
1. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   # macOS/Linux
   ifconfig
   ```

2. **Access from mobile:**
   - Connect device to same network
   - Navigate to: `http://[your-ip]:3000`

### Responsive Testing
- **Chrome DevTools**: Device simulation
- **Firefox**: Responsive design mode
- **Safari**: Web Inspector (iOS)

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables for Production
Set these in your hosting platform:
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
```

## 🎯 Development Workflow

### Recommended Development Process
1. **Start development server**: `npm run dev`
2. **Make changes**: Edit files in VS Code
3. **Check for errors**: `npm run lint && npm run type-check`
4. **Test functionality**: Use browser dev tools
5. **Format code**: `npm run format`
6. **Commit changes**: Use Git for version control

### Code Quality Checks
```bash
# Before committing
npm run lint:fix
npm run format
npm run type-check
npm run build
```

## 📞 Getting Help

### Resources
- **Project README**: Comprehensive documentation
- **Component Library**: Shadcn/UI docs
- **Tailwind CSS**: Official documentation
- **React**: Official documentation
- **TypeScript**: Language reference

### Community Support
- **GitHub Issues**: Report bugs and feature requests
- **Discord/Slack**: Community chat (if available)
- **Email Support**: contact@roxtonpos.com

---

## ✅ Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] npm 8+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file)
- [ ] Development server started (`npm run dev`)
- [ ] Application accessible at http://localhost:3000
- [ ] VS Code extensions installed (optional)
- [ ] Browser dev tools ready

**🎉 You're ready to develop with Roxton POS Pro!**

For additional help, refer to the main README.md or contact support.