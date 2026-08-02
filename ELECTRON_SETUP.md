# Pampanaa Desktop Application Setup (Electron)

This guide explains how to build and run Pampanaa as a native desktop application using Electron.

---

## Quick Start

### Development Mode

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2 (in another terminal): Run Electron in dev mode
npm run electron
```

The Electron app will open and connect to the dev server at `http://localhost:5173`. Hot reload works automatically.

### Production Build

```bash
# Build the React app for production
npm run build

# Package as desktop app (creates installers)
npm run electron-build
```

---

## File Structure

```
pampanaa/
├── public/
│   ├── electron.js          ← Main Electron process
│   ├── preload.js           ← Secure IPC bridge
│   └── [icons]              ← App icons (icon.png, icon.icns, icon.ico)
├── src/
│   ├── App.jsx
│   ├── main.jsx             ← React entry point
│   └── ...
├── dist/                    ← Built React app (created by npm run build)
├── package.json
├── vite.config.ts
└── ELECTRON_SETUP.md        ← This file
```

---

## Architecture

### Main Process (`public/electron.js`)
- Manages app lifecycle (launch, minimize, maximize, close)
- Creates and controls the main window
- Handles file dialogs and system operations
- Runs in Node.js environment; has full OS access

### Renderer Process (`src/` / React)
- React app rendered in Electron's window
- Sandboxed for security; cannot access Node.js directly
- Communicates with main process via IPC (Inter-Process Communication)

### Preload Script (`public/preload.js`)
- Bridge between renderer and main process
- Exposes safe APIs to React app via `window.electron`
- Uses `contextIsolation` and sandboxing for security

---

## Usage in React

### Accessing Electron APIs

```javascript
// In any React component:
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Access Electron API via window.electron (exposed in preload.js)
    if (window.electron) {
      window.electron.app.getVersion().then(setVersion);
    }
  }, []);

  return <div>Pampanaa v{version}</div>;
}
```

### Available APIs

```javascript
// App info
await window.electron.app.getVersion()   // Returns app version
await window.electron.app.getPath(name)  // Returns system path (e.g., 'userData', 'desktop')

// File dialogs
await window.electron.dialog.showSaveDialog({ ... })   // Save dialog
await window.electron.dialog.showOpenDialog({ ... })   // Open dialog

// System info
window.electron.platform   // 'darwin' (macOS), 'win32' (Windows), 'linux'
window.electron.arch       // 'x64', 'arm64', etc.
```

---

## Configuration

### App Info (`package.json`)

```json
{
  "main": "public/electron.js",
  "homepage": "./",
  "build": {
    "appId": "com.pampanaa.game",
    "productName": "Pampanaa",
    ...
  }
}
```

- `main`: Entry point for Electron
- `homepage`: Set to `./` for file-based (non-server) routing
- `build`: electron-builder configuration for packaging

### Build Targets

The `build` config in `package.json` defines output for each platform:

```json
{
  "build": {
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.games"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png",
      "category": "Game"
    }
  }
}
```

---

## Building Installers

### Windows
```bash
npm run electron-build
# Creates: dist/Pampanaa Setup 1.0.0.exe (NSIS installer)
#          dist/Pampanaa 1.0.0.exe (Portable standalone)
```

### macOS
```bash
npm run electron-build
# Creates: dist/Pampanaa-1.0.0.dmg (Disk image installer)
#          dist/Pampanaa-1.0.0.zip (Portable)
```

### Linux
```bash
npm run electron-build
# Creates: dist/Pampanaa-1.0.0.AppImage (Standalone, no install needed)
#          dist/Pampanaa_1.0.0_amd64.deb (Debian/Ubuntu package)
```

---

## Icons

Place icon files in the `assets/` directory (create if needed):

- **Windows:** `assets/icon.ico` (256x256 or larger)
- **macOS:** `assets/icon.icns` (1024x1024)
- **Linux:** `assets/icon.png` (512x512 or larger)

If icons are missing, electron-builder will generate placeholder icons.

---

## Development Workflow

### Hot Reload (Dev Mode)

1. **Vite Server:** Running on `http://localhost:5173`
2. **Electron Window:** Connects to `http://localhost:5173`
3. **Code Changes:** React files automatically rebuild; Electron window refreshes

### If Electron Won't Reload

```bash
# Kill Electron process and restart
npm run electron
```

### Debugging

#### React Dev Tools
```javascript
// In public/electron.js, uncomment to enable:
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

#### Console Logs
- React logs appear in DevTools console
- Main process logs appear in terminal where `npm run electron` was run

---

## Common Issues

### "Cannot find module 'electron-is-dev'"
```bash
npm install electron-is-dev
```

### "ENOENT: no such file or directory, open 'public/electron.js'"
- Ensure `public/electron.js` exists
- Check that `main` in package.json points to `public/electron.js`

### White screen on startup
- Check that Vite dev server is running (for dev mode)
- Check console for errors (`npm run electron` terminal or DevTools)

### Build fails "Icon not found"
- Place icon files in `assets/` directory
- Or disable icons in `package.json` `build` config (not recommended)

---

## Production Deployment

### Code Signing (Recommended for Distribution)

Code signing ensures users trust your app and it won't trigger security warnings.

#### macOS (requires Apple Developer account)
```bash
# In package.json build config:
"mac": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```

#### Windows (requires code signing certificate)
```bash
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password"
}
```

### Auto-Updates (Optional)

Use `electron-updater` for automatic app updates:

```bash
npm install electron-updater
```

```javascript
// In public/electron.js
import { autoUpdater } from 'electron-updater';
autoUpdater.checkForUpdatesAndNotify();
```

---

## Security Best Practices

### ✅ Already Implemented
- Context isolation enabled (`contextIsolation: true`)
- Sandbox enabled (`sandbox: true`)
- Preload script validates IPC calls
- No Node.js in renderer process

### ⚠️ Things to Avoid
- **Never** set `nodeIntegration: true`
- **Never** disable `contextIsolation`
- **Never** disable `sandbox`
- **Never** load untrusted external content
- **Never** use `eval()` or `Function()`

### 📋 Preload Script Guidelines

Add new APIs to `public/preload.js` only when needed:

```javascript
// Good: Expose safe, specific functions
contextBridge.exposeInMainWorld('myApi', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
});

// Bad: Expose all of Node.js
contextBridge.exposeInMainWorld('fs', require('fs'));
```

---

## Advanced: Custom File Operations

To read/write files from the React app:

### 1. Add IPC handler in `public/electron.js`
```javascript
ipcMain.handle('read-save', async (event, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});
```

### 2. Expose in `public/preload.js`
```javascript
contextBridge.exposeInMainWorld('electron', {
  // ... existing APIs
  files: {
    readSave: (path) => ipcRenderer.invoke('read-save', path),
  },
});
```

### 3. Use in React
```javascript
const saveData = await window.electron.files.readSave('/path/to/save');
```

---

## Next Steps

1. **Add app icons:** Place `icon.png`, `icon.icns`, `icon.ico` in `assets/`
2. **Update version:** Modify version in `package.json` for version bump
3. **Test on all platforms:** Build and test on Windows, macOS, Linux
4. **Enable auto-updates:** Integrate `electron-updater` (see Production Deployment)
5. **Distribute:** Share `.exe`, `.dmg`, `.AppImage`, or `.deb` files

---

## Useful Commands

```bash
npm run dev                  # Start Vite dev server
npm run electron             # Run Electron (connect to Vite dev server)
npm run electron-dev         # Build React + run Electron (no dev server)
npm run build                # Build React app for production
npm run electron-build       # Build React + create Electron installers
npm run lint                 # Run ESLint
npm run format               # Format code with Prettier
```

---

## Resources

- **Electron Docs:** https://www.electronjs.org/docs
- **electron-builder:** https://www.electron.build/
- **Preload Scripts & Security:** https://www.electronjs.org/docs/tutorial/security
- **IPC (Inter-Process Communication):** https://www.electronjs.org/docs/tutorial/ipc

---

## Support

For issues or questions:
1. Check Electron DevTools console (`Ctrl+Shift+I` or `Cmd+Option+I`)
2. Check terminal output where `npm run electron` was run
3. Review Electron documentation
4. Check GitHub Issues for similar problems
