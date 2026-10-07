const path = require('path');
const { app, BrowserWindow, shell } = require('electron');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 820,
        minWidth: 900,
        minHeight: 650,
        backgroundColor: '#0d1b2a',
        title: 'Coração do Rapha',
        icon: path.join(__dirname, '..', 'img', 'icon-512.png'),
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    win.once('ready-to-show', () => {
        win.show();
        if (isDev) win.focus();
    });

    win.loadFile(path.join(__dirname, '..', 'index.html'));

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
