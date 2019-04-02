const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// set env
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// List for the app to be ready
app.on('ready', function () {
    //create new window
    mainWindow = new BrowserWindow({ resizable: false });

    // load the HTML into the window
    // the below URL is just a fancy to pass that file path and name
    // It can be translated to: file://dirname/mainWindow.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
        nodeIntegration: false
    }));
    // quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    })


    // Build menu from templace
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // insert the menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {

    //create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping list item',
        // main window is parent, so this always show in front
        parent: mainWindow,
        // modal window, so you need close to proceed
        modal: true,
        // only show when ready
        show: false
    });

    addWindow.once('ready-to-show', () => {
        addWindow.show()
    });

    // load the HTML into the window
    // the below URL is just a fancy to pass that file path and name
    // It can be translated to: file://dirname/addWindow.html
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    });

    // remove menu bar from the child window
    addWindow.setMenuBarVisibility(false);


}

// catch item add
ipcMain.on('item:add', function (e, item) {
    console.log('Adding Item -> ' + item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


// create menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu: [
        {
            label: 'Add Item',
            accelerator: process.platform == 'win32' ? 'Ctrl+E' : 'Command+E',
            click() {
                createAddWindow();
            }
        },
        {
            label: 'Clear Items',
            accelerator: process.platform == 'win32' ? 'Ctrl+G' : 'Command+G',
            click() {
                mainWindow.webContents.send('item:clear');
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'win32' ? 'Ctrl+Q' : 'Command+Q',
            click() {
                app.quit();
            }
        }
    ]
}];

// IF mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// add developer tools if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'win32' ? 'Ctrl+I' : 'Command+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }

            },
            {
                role: 'reload'
            }]
    });
}