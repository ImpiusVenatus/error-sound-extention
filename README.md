## Error Sound Extension

This is a very simple VS Code / Cursor extension that plays a custom sound whenever:

- **Diagnostics** with severity Error appear in your workspace.
- **Terminal output** looks like an error (matches simple regex patterns, including HTTP 4xx/5xx codes).

### Setup

- Put your sound file (e.g. `error.wav`) somewhere inside your workspace, for example:
  - `assets/error.wav`
- In your VS Code or Cursor `settings.json`, configure:

```json
{
  "errorSound.filePath": "assets/error.wav"
}
```

Optional settings:

- `errorSound.enableDiagnostics` (boolean, default `true`)
- `errorSound.enableTerminal` (boolean, default `true`)
- `errorSound.terminalPatterns` (string[], default `["error", "exception", "\\b(4\\d{2}|5\\d{2})\\b"]`)

### Development

- Install dependencies (run this in the extension folder):

```bash
npm install
```

- Compile:

```bash
npm run compile
```

### Packaging for VS Code

To install this extension on any machine as a `.vsix` file:

1. **Install `vsce` (VS Code Extension Manager)** on a machine with Node.js:
   - Using npm:

   ```bash
   npm install -g @vscode/vsce
   ```

2. **Build the extension package** (from the extension folder that contains `package.json`):

```bash
vsce package
```

This creates a file like `error-sound-extension-0.0.1.vsix` in the same folder.

3. **Install the `.vsix` into VS Code** on any desktop:
   - Open VS Code.
   - Go to the **Extensions** view.
   - Click the `...` menu (top-right) → **Install from VSIX...**.
   - Select your `.vsix` file and confirm.

Alternatively, from a terminal:

```bash
code --install-extension error-sound-extension-0.0.1.vsix
```

You can now share the `.vsix` file and install it on any VS Code instance.

