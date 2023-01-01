import { app, BrowserWindow, dialog, ipcMain, shell } from "electron"
const { readFileSync, writeFile } = require("fs")
const xml2js = require('xml2js')

var configFile = JSON.parse(readFileSync("./resources/config.json"))

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const isDev = process.env.ELECTRON_ENV !== "development"

let isDev = false

function createWindow () {
  mainWindow = new BrowserWindow({
    width: isDev? 1100 : 550,
    height: 850,
    backgroundColor: "#191622",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    frame: false,
    resizable: false
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on("closed", () => {
    mainWindow = null
  })
  
  // Send config file to React ( Work also on build )
  mainWindow.webContents.on("did-finish-load", () => mainWindow?.webContents.send("Loaded", configFile) );
}

async function registerListeners () {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on("message", (_, message, data, data2) => {
    // Receive Message from React
    if (message == "appQuit") {
      // Quit App
      app.quit()
    } else if (message == "appMinimize") {
      // Minimize App
      mainWindow? mainWindow.minimize() : alert()
    } else if ( message == "discord" ) {
      // Open Discord in default web browser
      shell.openExternal(data)
    } else if ( message == "generate" ) {
      // generate door audio file
      saveFile(data)
    } else if (message == "openFile") {
      getFile()
    } else {
      // Receive unkown Message and Data from React
      // console.log(message, JSON.stringify(data))
    }
  })
}

app.on("ready", createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const doorXML = (data: []) => {
  return data.reduce((result: string, item: { doorName: string; doorHash: string; soundSet: string; Params: string; value: number }) => {
   return result + `\n    <Item type="Door" ntOffset="0">\n      <Name>d_${item.doorName}</Name>\n      <SoundSet>${item.soundSet}</SoundSet>\n      <Params>${item.Params}</Params>\n      <Unk1 value="${item.value}" />\n    </Item>`
  }, "")
}

const doorModelXML = (data: []) => {
  return data.reduce((result: string, item: { doorName: string; doorHash: string; soundName: string }) => {
   return result + `\n    <Item type="DoorModel" ntOffset="0">\n      <Name>dasl_${item.doorHash}</Name>\n      <Door>d_${item.doorName}</Door>\n    </Item>`
  }, "")
}

const nameTableXML = (data: []) => {
  return data.reduce((result: string, item: { doorName: string }) => {
   return result + `d_${item.doorName}\n`
  }, "")
}

function saveFile(data: []) {
  let fileSelectionPromise = dialog.showSaveDialog({defaultPath: "c:/door_test_game.dat151.rel.xml"});
  fileSelectionPromise.then(function(obj) {
    // console.log(JSON.stringify(obj, null, '\t'))
    const filePath = String(obj.filePath)
    let xml
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Dat151>\n  <Version value="9458585" />\n  <Items>${doorXML(data)}${doorModelXML(data)}\n  </Items>\n</Dat151>`
    writeFile(filePath, xml, (err: boolean) => {
      if (err) {
        console.error(err)
      }
      let fileSelectionPromiseNameTable = dialog.showSaveDialog({defaultPath: "c:/game.dat151.nametable"});
      fileSelectionPromiseNameTable.then(function(obj) {
        const filePath = String(obj.filePath)
        let nameTable: any
        nameTable = `${nameTableXML(data)}`
        writeFile(filePath, nameTable, (err: boolean) => {
          if (err) {
            console.error(err)
          }
        })
      });
    })
  });
  
}

var fileData: any
function getFile() {
  let fileSelectionPromise = dialog.showOpenDialog({properties: ["openFile"]});
  fileSelectionPromise.then(function(obj) {
    const filePaths = String(obj.filePaths)
    fileData = readFileSync(filePaths)
    xmlToJSON(fileData).catch(err => console.error("ERR", err));
  });
}

async function xmlToJSON(array: any) {
   xml2js.parseString(array, function(err: any, result: any) {
    mainWindow?.webContents.send("xmlData", result)
  })
}