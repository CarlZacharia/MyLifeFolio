import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from '../lib/AuthContext'
import { ReauthPrefsProvider } from '../lib/ReauthPrefsContext'
import { EnabledCategoriesProvider } from '../lib/EnabledCategoriesContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ReauthPrefsProvider>
        <EnabledCategoriesProvider>
          <App />
        </EnabledCategoriesProvider>
      </ReauthPrefsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
