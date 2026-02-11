const {app, BrowserWindow} = require('electron');
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

  mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
