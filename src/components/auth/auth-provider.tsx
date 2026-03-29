/**
 * Auth provider compatibility shim for Electron.
 * Re-exports from the main ElectronAuthContext.
 */

export { useAuth, ElectronAuthProvider as AuthProvider } from '../../../lib/ElectronAuthContext';
