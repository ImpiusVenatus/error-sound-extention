import * as vscode from 'vscode';
import { spawn } from 'child_process';

let lastPlayedAt = 0;
let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Error Sound');
  }
  return outputChannel;
}

export function playErrorSound(soundUri: vscode.Uri | undefined): void {
  if (!soundUri) {
    return;
  }

  const now = Date.now();
  if (now - lastPlayedAt < 2000) {
    return;
  }
  lastPlayedAt = now;

  const channel = getOutputChannel();

  if (process.platform !== 'win32') {
    channel.appendLine('ErrorSound: Non-Windows platform detected; skipping sound playback.');
    return;
  }

  const filePath = soundUri.fsPath.replace(/'/g, "''");
  const script = `(New-Object Media.SoundPlayer '${filePath}').PlaySync()`;

  try {
    const child = spawn('powershell.exe', ['-NoProfile', '-Command', script], {
      detached: true,
      windowsHide: true
    });

    child.on('error', (err: Error) => {
      channel.appendLine(`ErrorSound: Failed to play sound - ${err.message}`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    channel.appendLine(`ErrorSound: Exception while spawning PowerShell - ${message}`);
  }
}
