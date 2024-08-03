const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

// main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 650,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        }
    });

    // Open devtools in dev
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
})

// Menu
const menu = [
    ...(isMac
        ? [
            {
              label: 'Image Resizer',
              submenu: [
                {
                  label: 'About',
                  click: createAboutWindow,
                },
              ],
            },
          ]
        : []),
      {
        role: 'fileMenu',
      },
      ...(!isMac
        ? [
            {
              label: 'Help',
              submenu: [
                {
                  label: 'About',
                  click: createAboutWindow,
                },
              ],
            },
          ]
        : []),
];

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})