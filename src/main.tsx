import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { ElectronAuthProvider, useAuth } from '../lib/ElectronAuthContext'
import { ReauthPrefsProvider } from '../lib/ReauthPrefsContext'
import UnlockScreen from './pages/UnlockScreen'
import SetupScreen from './pages/SetupScreen'
import { Box, CircularProgress } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Minimal theme for the lock/setup screens
const lockTheme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
  },
})

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnlocked, isSetup, loading, unlock, setup } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isSetup) {
    return (
      <ThemeProvider theme={lockTheme}>
        <CssBaseline />
        <SetupScreen onSetup={setup} />
      </ThemeProvider>
    )
  }

  if (!isUnlocked) {
    return (
      <ThemeProvider theme={lockTheme}>
        <CssBaseline />
        <UnlockScreen onUnlock={unlock} />
      </ThemeProvider>
    )
  }

  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ElectronAuthProvider>
        <AuthGate>
          <ReauthPrefsProvider>
            <App />
          </ReauthPrefsProvider>
        </AuthGate>
      </ElectronAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
