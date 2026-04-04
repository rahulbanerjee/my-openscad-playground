# OpenSCAD Playground - Custom Build

Fork of [OpenSCAD Playground](https://ochafik.com/openscad2) with custom enhancements for local development.

See [README_original.md](./README_original.md) for the original project documentation.

## Custom Changes

### Dark Mode
Enabled dark theme across the entire application:
- Monaco editor set to `vs-dark` theme
- PrimeReact UI switched to `lara-dark-indigo` theme
- Custom CSS overrides to ensure consistent dark backgrounds

### Save/Load Server
Added a simple HTTP server for persisting and loading playground state (OpenSCAD source, parameters, view settings).

**Start the server:**
```bash
npm run server
```
The server listens on `http://0.0.0.0:8284` and provides:
- `POST /save` - Save current state to `playground-state.json`
- `GET /load` - Load saved state

**UI Controls:**
- Server URL input field (default: `http://vm-dev:8284`)
- **Save** button - persist current work to server
- **Load** button - restore saved work from server

### Editor Debouncing
Editor updates are debounced by 10 seconds to prevent performance issues during typing. State (and URL fragment) only updates after you stop typing for 10 seconds.

### New Scripts
- `npm run server` - Start the save/load server
- `npm run build:dev` - Fast development build (~10-15s)

## Quick Start

```bash
# Terminal 1: Start the save/load server
npm run server

# Terminal 2: Start the playground
npm start
```

Then open http://localhost:4000/ and use the Save/Load buttons in the footer.

## Implementation Notes

### Dark Mode
- `src/index.tsx` - Switched to `lara-dark-indigo` PrimeReact theme
- `src/index.css` - Added dark background overrides for Monaco editor
- `src/components/EditorPanel.tsx` - Set Monaco theme to `vs-dark`

### Save/Load Server
- `src/state/model.ts` - Added `saveToServer()` and `loadFromServer()` methods
- `src/components/Footer.tsx` - Added Save/Load UI controls
- `src/state/fragment-state.ts` - Exported `decompressString` for reuse
- `src/components/EditorPanel.tsx` - Added 10-second debounce to editor
- `server.mjs` - CORS-enabled save/load server (new file)
