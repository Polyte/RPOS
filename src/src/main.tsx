import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../styles/globals.css'

// Enable React strict mode for development
const StrictModeWrapper = ({ children }: { children: React.ReactNode }) => {
  if (import.meta.env.DEV) {
    return <React.StrictMode>{children}</React.StrictMode>
  }
  return <>{children}</>
}

// Enhanced error handling for production
const handleGlobalError = (error: Error, errorInfo?: any) => {
  if (import.meta.env.PROD) {
    // In production, log errors but don't crash the app
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorInfo
    })
  } else {
    // In development, show full error details
    console.error('Development Error:', error, errorInfo)
  }
}

// Global error boundary
window.addEventListener('error', (event) => {
  handleGlobalError(event.error || new Error(event.message))
})

window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(new Error(`Unhandled Promise: ${event.reason}`))
})

// Initialize React app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

const root = ReactDOM.createRoot(rootElement)

// Render app with error handling
try {
  root.render(
    <StrictModeWrapper>
      <App />
    </StrictModeWrapper>
  )
} catch (error) {
  handleGlobalError(error as Error)
  
  // Fallback UI in case of critical render errors
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: 'Josefin Sans', sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 2rem;
      text-align: center;
    ">
      <h1 style="color: #1e40af; font-size: 2rem; margin-bottom: 1rem;">
        Roxton POS Pro
      </h1>
      <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 2rem; max-width: 500px;">
        We're experiencing technical difficulties. Please refresh the page or contact support if the problem persists.
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.transform='translateY(-2px)'"
        onmouseout="this.style.transform='translateY(0)'"
      >
        Refresh Page
      </button>
    </div>
  `
}

// Performance monitoring
if (import.meta.env.DEV) {
  // Development performance metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('Navigation timing:', entry)
      }
    }
  })
  
  try {
    observer.observe({ entryTypes: ['navigation'] })
  } catch (e) {
    // PerformanceObserver not supported
  }
}

// PWA update handling
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if (confirm('A new version of Roxton POS Pro is available. Would you like to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })
  })
}

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('../App.tsx', () => {
    // Re-render app on hot reload
    import('../App.tsx').then((module) => {
      const NextApp = module.default
      root.render(
        <StrictModeWrapper>
          <NextApp />
        </StrictModeWrapper>
      )
    })
  })
}