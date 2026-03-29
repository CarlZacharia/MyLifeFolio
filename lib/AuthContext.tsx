/**
 * Auth context compatibility shim for the Electron desktop version.
 *
 * Re-exports ElectronAuthContext as AuthContext so all existing imports
 * (`import { useAuth } from '../lib/AuthContext'`) continue to work.
 */

export { useAuth, ElectronAuthProvider as AuthProvider } from './ElectronAuthContext';
export { default } from './ElectronAuthContext';
