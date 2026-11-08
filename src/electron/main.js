const {app, BrowserWindow, shell, ipcMain, Menu, session, desktopCapturer} = require('electron');
const path = require('path');

let mainWindow;

// Only these schemes may be handed to the OS. Links come from untrusted chat content,
// so e.g. file://, smb:// or custom protocol handlers must never be opened.
const EXTERNAL_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function openExternalSafe(url) {
  let protocol;
  try {
    protocol = new URL(url).protocol;
  } catch {
    console.warn("blocked opening invalid url", url);
    return;
  }
  if (!EXTERNAL_URL_PROTOCOLS.has(protocol)) {
    console.warn("blocked opening url with disallowed protocol " + protocol, url);
    return;
  }
  shell.openExternal(url);
}

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
    openExternalSafe(url);
    return {action: 'deny'}; // prevent Electron from opening a new window
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      openExternalSafe(url);
    }
  });

  // Electron rejects navigator.mediaDevices.getDisplayMedia() unless a handler is registered.
  // On Wayland, desktopCapturer.getSources() opens the xdg-desktop-portal picker (PipeWire)
  // and returns only the source the user picked. On X11/Windows/macOS it lists every source
  // without a picker, so the first (primary) screen is used.
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({types: ['screen', 'window']});
      if (sources.length === 0) {
        callback({}); // picker cancelled -> NotAllowedError in the renderer
        return;
      }
      callback({video: sources[0]});
    } catch (e) {
      console.error("display media request failed", e);
      callback({});
    }
  });

  mainWindow.loadURL(startUrl);
}

// Linux Wayland: capture screens through PipeWire (default in recent Electron, kept as a safety net)
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
