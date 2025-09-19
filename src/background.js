'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from "electron-updater"
const isDevelopment = process.env.NODE_ENV !== 'production'

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

initLogUpdate();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}



function initLogUpdate() {
    autoUpdater.on('checking-for-update', () => {
        console.log('11 Checking for update...')
        showUpdateWindow('Checking for update...')
    })
    autoUpdater.on('update-available', (info) => {
        console.log('22 Update available.', info)
        showUpdateWindow(`Update available: ${info.version}`)
    })
    autoUpdater.on('update-not-available', (info) => {
        console.log('33 Update not available.', info)
        showUpdateWindow('No updates found')
    })
    autoUpdater.on('error', (err) => {
        console.error('44 Error in auto-updater:', err)
        showUpdateWindow(`Error: ${err.message}`)
    })
    autoUpdater.on('download-progress', (progress) => {
        console.log(`55 Download speed: ${progress.bytesPerSecond}, Downloaded ${progress.percent}%`)
        showUpdateWindow(`Downloading: ${Math.round(progress.percent)}%`)
    })
    autoUpdater.on('update-downloaded', (info) => {
        console.log('66 Update downloaded', info)
        showUpdateWindow('Update downloaded. Restarting...')
        autoUpdater.quitAndInstall()
    })
}



function showUpdateWindow(message) {
    const win = new BrowserWindow({
        width: 400,
        height: 150,
        title: 'AutoUpdater Status',
        alwaysOnTop: true,
        frame: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Виводимо простий HTML із повідомленням
    win.loadURL('data:text/html;charset=utf-8,' +
        encodeURIComponent(`<h3>${message}</h3>`))

    // Закриваємо вікно автоматично через 3 секунди
    setTimeout(() => {
        if (!win.isDestroyed()) win.close()
    }, 3000)
}
