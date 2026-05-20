import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './state/AuthContext.tsx'
import { FavoritesProvider } from './state/FavoritesContext.tsx'
import { ThemeProvider } from './state/ThemeContext.tsx'
import { redirectOAuthCallbackIfNeeded } from './utils/oauthCallbackRedirect.ts'

redirectOAuthCallbackIfNeeded()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <App />
            <Analytics />
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
