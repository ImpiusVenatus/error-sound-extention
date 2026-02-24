## Error Sound Extension

This extension plays a built‑in sound effect whenever something goes wrong in your coding workflow, such as:

- **Diagnostics** with severity Error appearing in your project.

The sound file is bundled with the extension (no configuration needed).

### Install from the Marketplace

1. Open your editor (for example, VS Code or Cursor).
2. Go to the **Extensions** view.
3. Search for **“Error Sound Extension”** by publisher `ImpiusVenatus`.
4. Click **Install**, then reload the editor if prompted.

### Install from a GitHub Release (`.vsix`)

1. Go to the repository releases page, for example the latest release:

   `https://github.com/ImpiusVenatus/error-sound-extention/releases/latest`

2. Download the `.vsix` file from the **Assets** section (for example `error-sound-extension-0.0.2.vsix` or newer).
3. In your editor:

   - Open the **Extensions** view.
   - Open the **More actions** menu (three dots) in the Extensions view, or use the command palette and run **“Extensions: Install from VSIX...”**.
   - Select the downloaded `.vsix` file and confirm.
4. Reload the editor if prompted.

### Build and install from source (optional)

1. Build the extension package as a `.vsix` file (from the folder containing `package.json`):

   ```bash
   vsce package
   ```

   This creates a file like `error-sound-extension-0.0.2.vsix`.

2. Install the `.vsix` into your editor:

   - Open your editor (for example, VS Code).
   - Open the extensions view.
   - Use the menu option to **Install from VSIX...**.
   - Select the generated `.vsix` file and confirm.

3. Reload the editor if prompted. The bundled sound will now play automatically when errors are detected.

