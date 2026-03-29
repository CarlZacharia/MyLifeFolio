"use strict";
const electron = require("electron");
const electronAPI = {
  // Database operations
  db: {
    query: (table, method, params) => electron.ipcRenderer.invoke("db:query", table, method, params),
    execute: (sql, params) => electron.ipcRenderer.invoke("db:execute", sql, params),
    rpc: (functionName, params) => electron.ipcRenderer.invoke("db:rpc", functionName, params)
  },
  // Authentication
  auth: {
    isSetup: () => electron.ipcRenderer.invoke("auth:isSetup"),
    setup: (passphrase) => electron.ipcRenderer.invoke("auth:setup", passphrase),
    unlock: (passphrase) => electron.ipcRenderer.invoke("auth:unlock", passphrase),
    lock: () => electron.ipcRenderer.invoke("auth:lock"),
    changePassphrase: (current, newPassphrase) => electron.ipcRenderer.invoke("auth:changePassphrase", current, newPassphrase),
    isUnlocked: () => electron.ipcRenderer.invoke("auth:isUnlocked")
  },
  // PDF operations
  pdf: {
    encrypt: (pdfBytes, userPassword) => electron.ipcRenderer.invoke("pdf:encrypt", pdfBytes, userPassword),
    saveToFile: (bytes, suggestedName) => electron.ipcRenderer.invoke("pdf:saveToFile", bytes, suggestedName),
    saveToUserData: (bytes, fileName) => electron.ipcRenderer.invoke("pdf:saveToUserData", bytes, fileName)
  },
  // Cloud publishing
  upload: {
    publishReport: (params) => electron.ipcRenderer.invoke("upload:publishReport", params),
    revokeReport: (reportType) => electron.ipcRenderer.invoke("upload:revokeReport", reportType),
    getPublishedReports: () => electron.ipcRenderer.invoke("upload:getPublishedReports")
  },
  // App info
  app: {
    getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
    getPlatform: () => electron.ipcRenderer.invoke("app:getPlatform"),
    getUserDataPath: () => electron.ipcRenderer.invoke("app:getUserDataPath")
  },
  // File operations (local storage replacement)
  files: {
    save: (bucketName, filePath, data, contentType) => electron.ipcRenderer.invoke("files:save", bucketName, filePath, data, contentType),
    read: (bucketName, filePath) => electron.ipcRenderer.invoke("files:read", bucketName, filePath),
    remove: (bucketName, filePaths) => electron.ipcRenderer.invoke("files:remove", bucketName, filePaths),
    getUrl: (bucketName, filePath) => electron.ipcRenderer.invoke("files:getUrl", bucketName, filePath)
  },
  // Event listeners
  onAutoLock: (callback) => {
    electron.ipcRenderer.on("auto-lock", callback);
    return () => electron.ipcRenderer.removeListener("auto-lock", callback);
  },
  // Activity tracking
  reportActivity: () => electron.ipcRenderer.send("user-activity")
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
