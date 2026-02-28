const {app, BrowserWindow, shell} = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Dev vs Prod
  const startUrl =
    process.env.ELECTRON_START_URL ||
    (process.env.NODE_ENV === 'development' ?
      'http://localhost:4200' :
      `file://${path.join(__dirname, '../../dist/webrtc-client/browser/index.html')}`
    )
  ;

    // Intercept opening links in the electron window and open in an external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' }; // prevent Electron from opening a new window
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url !== mainWindow.webContents.getURL()) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

  mainWindow.loadURL(startUrl);
}

// Fix for Linux Wayland Issues
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
app.commandLine.appendSwitch('enable-webrtc-pipewire-capturer');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
