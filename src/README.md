# Roxton POS Pro

A comprehensive Point of Sale (POS) interface system with multiple user roles including cashier, admin, manager, and stock taking functionality. Built with React, TypeScript, Tailwind CSS, and Supabase.

![Roxton POS Pro](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg)

## 🌟 Features

### Core Functionality
- **Multi-Role System**: Cashier, Admin, Manager, and Stock interfaces
- **Real-time Operations**: Live inventory updates and transaction processing
- **Offline Capability**: Works without internet connection
- **Receipt Printing**: Professional thermal printer integration
- **VAT Calculations**: South African VAT (15%) compliance
- **Currency Support**: ZAR (South African Rand) with proper formatting

### User Interfaces
- **Cashier Interface**: Point of sale operations, product scanning, payments
- **Admin Interface**: System management, user control, analytics dashboard
- **Manager Interface**: Business insights, reporting, performance metrics
- **Stock Interface**: Inventory management, stock levels, product catalog

### Technical Features
- **Modern Design**: Glass morphism effects, animations, dark/light themes
- **Responsive Layout**: Optimized for 11-15 inch displays, mobile-friendly
- **Performance Optimized**: Lazy loading, code splitting, caching
- **PWA Ready**: Installable as a Progressive Web App
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Accessibility**: WCAG compliant with screen reader support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Supabase** account (for backend services)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/roxton-pos-pro.git
cd roxton-pos-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment configuration:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Setup Supabase (Optional)

If you want to use the backend functionality:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
npm run supabase:start

# Check status
npm run supabase:status
```

## 📦 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint code linting
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Build & Deploy
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run clean` - Clean build cache and node_modules

### Database & Backend
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:reset` - Reset local database

## 🏗️ Project Structure

```
roxton-pos-pro/
├── components/                 # React components
│   ├── ui/                    # Shadcn/UI components
│   ├── AdminInterface.tsx     # Admin dashboard
│   ├── CashierInterface.tsx   # POS interface
│   ├── ManagerInterface.tsx   # Manager dashboard
│   ├── StockInterface.tsx     # Inventory management
│   └── ...
├── utils/                     # Utility functions
│   ├── app-constants.tsx      # Application constants
│   ├── app-helpers.tsx        # Helper functions
│   └── supabase/             # Supabase utilities
├── supabase/                  # Backend functions
│   └── functions/
│       └── server/           # Edge functions
├── styles/                   # Global styles
│   └── globals.css          # Tailwind CSS + custom styles
├── public/                  # Static assets
├── src/                    # Source files
│   └── main.tsx           # Application entry point
├── App.tsx               # Main application component
├── package.json         # Project dependencies
├── vite.config.ts      # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## 🎨 Design System

### Theme Configuration
- **Primary Font**: Josefin Sans
- **Color Scheme**: Blue-based with professional gradients
- **Glass Morphism**: Modern frosted glass effects
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Automatic system preference detection

### Component Library
- **UI Components**: Shadcn/UI with custom styling
- **Icons**: Lucide React icon set
- **Charts**: Recharts for analytics visualization
- **Notifications**: Toast notifications with Sonner
- **Forms**: React Hook Form with validation

## 📱 User Roles & Access

### 🏪 Cashier Interface
- Product scanning and search
- Transaction processing
- Payment handling
- Receipt generation
- Basic inventory lookup

### 👤 Admin Interface
- User management
- System configuration
- Security settings
- API monitoring
- System analytics

### 📊 Manager Interface
- Sales reporting
- Performance analytics
- Business insights
- Revenue tracking
- Staff performance

### 📦 Stock Interface
- Inventory management
- Stock level monitoring
- Product catalog
- Supplier management
- Stock adjustments

## 🛠️ Configuration Options

### Business Settings
Update your business information in `.env.local`:

```env
VITE_BUSINESS_NAME=Your Business Name
VITE_BUSINESS_ADDRESS=Your Address
VITE_BUSINESS_PHONE=Your Phone
VITE_BUSINESS_EMAIL=Your Email
```

### Currency & VAT
Configure regional settings:

```env
VITE_VAT_RATE=15
VITE_CURRENCY_CODE=ZAR
VITE_CURRENCY_SYMBOL=R
VITE_TIMEZONE=Africa/Johannesburg
```

### Feature Flags
Enable/disable features:

```env
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_RECEIPT_PRINT=true
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy-loaded route components
- **Bundle Analysis**: Optimized chunk sizes
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker with intelligent caching
- **Tree Shaking**: Dead code elimination
- **Minification**: Production build optimization

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔒 Security

### Security Features
- **Environment Variables**: Secure API key management
- **Input Validation**: Client-side and server-side validation
- **Error Handling**: Secure error messages
- **HTTPS**: Enforced secure connections
- **Rate Limiting**: API endpoint protection

### Best Practices
- Regular dependency updates
- Secure authentication flows
- Data encryption at rest
- Audit logging
- GDPR compliance ready

## 📚 API Documentation

### Supabase Edge Functions
- **`/transactions`** - Handle POS transactions
- **`/inventory`** - Manage product inventory
- **`/products`** - Product catalog operations
- **`/daily-targets`** - Sales target management

### Local Development
When running locally, APIs are available at:
```
http://localhost:54321/functions/v1/make-server-ca72a349/
```

## 🚀 Deployment

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
Make sure to set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run dev
```

#### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Clean TypeScript cache
rm -rf node_modules/.cache
npm run dev
```

#### Build Failures
```bash
# Check for type errors
npm run type-check

# Check for linting issues
npm run lint

# Clean build
rm -rf dist
npm run build
```

#### Supabase Connection Issues
- Verify environment variables
- Check network connectivity
- Confirm Supabase project status

### Getting Help
- Check the [Issues](https://github.com/your-username/roxton-pos-pro/issues) section
- Review the [Wiki](https://github.com/your-username/roxton-pos-pro/wiki) documentation
- Contact support at [support@roxtonpos.com]

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checking
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for backend services
- [Lucide](https://lucide.dev/) for icons
- [React](https://reactjs.org/) team for the framework

## 📞 Support

- **Email**: support@roxtonpos.com
- **Documentation**: https://docs.roxtonpos.com
- **Community**: https://discord.gg/roxtonpos

---

<div align="center">
  <strong>Built with ❤️ for modern retail businesses</strong>
</div>
```