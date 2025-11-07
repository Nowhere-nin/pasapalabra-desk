// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       contextIsolation: true,
//     },
//   });

//   // En desarrollo, usa Vite dev server
//   const startUrl =
//     process.env.ELECTRON_START_URL ||
//     `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;

//   win.loadURL(startUrl);
// }

// app.whenReady().then(createWindow);

const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

const store = new Store();

function createWindow() {
  // Obtener tamaño de pantalla disponible
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Crear la ventana principal
  const win = new BrowserWindow({
    width: Math.floor(width * 0.9),  // 90% del ancho de la pantalla
    height: Math.floor(height * 0.9), // 90% del alto
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // URL de inicio: dev server o build
  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;

  win.loadURL(startUrl);

  // Opcional: maximizar la ventana al abrir
  // win.maximize();

  // Centrar ventana en pantalla
  win.center();

  // Fijar zoom para evitar escalado extraño
  win.webContents.setZoomFactor(1);
  win.webContents.setVisualZoomLevelLimits(1, 1);

  // Abrir DevTools solo en desarrollo
  if (process.env.ELECTRON_START_URL) {
    win.webContents.openDevTools();
  }
}

ipcMain.handle('store:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (event, { key, value }) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store:delete', (event, key) => {
  store.delete(key);
  return true;
});

app.whenReady().then(createWindow);

// Cerrar correctamente en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});