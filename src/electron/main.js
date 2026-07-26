const {app, BrowserWindow, shell, ipcMain, Menu} = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  console.log("using environment " + process.env.NODE_ENV + " (optional start url is " + process.env.ELECTRON_START_URL + ")");
  // Dev vs Prod
  const startUrl =
    process.env.ELECTRON_START_URL ||
    (process.env.NODE_ENV === 'development' ?
        'http://localhost:4200' :
        `file://${path.join(__dirname, '../../dist/onyx-client/browser/index.html')}`
    )
  ;

  const menu = Menu.buildFromTemplate([
    {role: 'copy'},
    {role: 'cut'},
    {role: 'paste'},
    {role: 'selectall'}
  ])

  ipcMain.on('context-menu', (event) => {
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender)
    })
  })

  // menu
  function hydrateTemplate(items) {
    return items.map(item => {
      const hydrated = {...item};

      if (item.submenu) {
        hydrated.submenu = hydrateTemplate(item.submenu);
      } else if (item.id) {
        // only attach click if there's no role and it's a leaf item
        hydrated.click = () => {
          console.log("clicked ",item)
          mainWindow?.webContents.send('menu-item-click', item.id);
        };
      }
      return hydrated;
    });
  }

  ipcMain.on('set-application-menu', (_event, template) => {
    const menu = Menu.buildFromTemplate(hydrateTemplate(template));
    Menu.setApplicationMenu(menu);
  });

  // Intercept opening links in the electron window and open in an external browser
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'}; // prevent Electron from opening a new window
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
