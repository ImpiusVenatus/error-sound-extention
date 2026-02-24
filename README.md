## Error Sound Extension

This extension plays a built‑in sound effect whenever something goes wrong in your coding workflow, such as:

- **Diagnostics** with severity Error appearing in your project.
- **Terminal output** that looks like an error (for example lines containing “error”, “exception”, or HTTP 4xx/5xx status codes like 404 or 500).

The sound file is bundled with the extension (no configuration needed).

### How to install (from a local build)

1. Build the extension package as a `.vsix` file (from the folder containing `package.json`):

   ```bash
   vsce package
   ```

   This creates a file like `error-sound-extension-0.0.1.vsix`.

2. Install the `.vsix` into your editor:

   - Open your editor (for example, VS Code).
   - Open the extensions view.
   - Use the menu option to **Install from VSIX...**.
   - Select the generated `.vsix` file and confirm.

3. Reload the editor if prompted. The bundled sound will now play automatically when errors are detected.

### How to install (from GitHub Releases)

1. Go to the repository releases page, for example the latest release:

   `https://github.com/ImpiusVenatus/error-sound-extention/releases/latest`

2. Download the `.vsix` file from the **Assets** section (for example `error-sound-extension-0.0.1.vsix`).

3. In your editor:

   - Open the extensions view.
   - Use the menu option to **Install from VSIX...**.
   - Select the downloaded `.vsix` file and confirm.

4. Reload the editor if prompted.

