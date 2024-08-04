const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

let mainWindow;

// main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 650,
        webPreferences: {
          nodeIntegration: true, // 允许require和prcoess访问Node底层API
          contextIsolation: true, // 启用上文隔离，防止preload
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

// Main entrance
app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // 防止内存泄露
  mainWindow.on('closed', () => {
    console.log('event closed');
    mainWindow = null;
  });

  app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})

// Inner function
async function resizeImage({ filePath, width, height, dest}) {
  try {
    const image = await resizeImg(
      fs.readFileSync(filePath),
      {
        width: +width,
        height: +height,
      }
    );

    // Get file name
    const filename = path.basename(filePath);
    // Create folder
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    // Save file
    fs.writeFileSync(path.join(dest, filename), image);

    // Send success to render
    mainWindow.webContents.send('image:done');

    // Open dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// Response to ipcRenderer
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  console.log(options);
  resizeImage(options);
});

// Listen Quit
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})
