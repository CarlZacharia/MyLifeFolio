import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Database operations
  db: {
    query: (table: string, method: string, params: unknown) =>
      ipcRenderer.invoke('db:query', table, method, params),
    execute: (sql: string, params?: unknown[]) =>
      ipcRenderer.invoke('db:execute', sql, params),
    rpc: (functionName: string, params: unknown) =>
      ipcRenderer.invoke('db:rpc', functionName, params),
  },

  // Authentication
  auth: {
    isSetup: () => ipcRenderer.invoke('auth:isSetup'),
    setup: (passphrase: string) => ipcRenderer.invoke('auth:setup', passphrase),
    unlock: (passphrase: string) => ipcRenderer.invoke('auth:unlock', passphrase),
    lock: () => ipcRenderer.invoke('auth:lock'),
    changePassphrase: (current: string, newPassphrase: string) =>
      ipcRenderer.invoke('auth:changePassphrase', current, newPassphrase),
    isUnlocked: () => ipcRenderer.invoke('auth:isUnlocked'),
    getVaultPref: () => ipcRenderer.invoke('auth:getVaultPref'),
    setVaultPref: (extraSecurity: boolean) =>
      ipcRenderer.invoke('auth:setVaultPref', extraSecurity),
  },

  // PDF operations
  pdf: {
    encrypt: (pdfBytes: Uint8Array, userPassword: string) =>
      ipcRenderer.invoke('pdf:encrypt', pdfBytes, userPassword),
    saveToFile: (bytes: Uint8Array, suggestedName: string) =>
      ipcRenderer.invoke('pdf:saveToFile', bytes, suggestedName),
    saveToUserData: (bytes: Uint8Array, fileName: string) =>
      ipcRenderer.invoke('pdf:saveToUserData', bytes, fileName),
  },

  // Cloud publishing
  upload: {
    publishReport: (params: unknown) =>
      ipcRenderer.invoke('upload:publishReport', params),
    revokeReport: (reportType: string) =>
      ipcRenderer.invoke('upload:revokeReport', reportType),
    getPublishedReports: () =>
      ipcRenderer.invoke('upload:getPublishedReports'),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
  },

  // File operations (local storage replacement)
  files: {
    save: (bucketName: string, filePath: string, data: Uint8Array, contentType: string) =>
      ipcRenderer.invoke('files:save', bucketName, filePath, data, contentType),
    read: (bucketName: string, filePath: string) =>
      ipcRenderer.invoke('files:read', bucketName, filePath),
    remove: (bucketName: string, filePaths: string[]) =>
      ipcRenderer.invoke('files:remove', bucketName, filePaths),
    getUrl: (bucketName: string, filePath: string) =>
      ipcRenderer.invoke('files:getUrl', bucketName, filePath),
  },

  // Event listeners
  onAutoLock: (callback: () => void) => {
    ipcRenderer.on('auto-lock', callback);
    return () => ipcRenderer.removeListener('auto-lock', callback);
  },

  // Activity tracking
  reportActivity: () => ipcRenderer.send('user-activity'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
