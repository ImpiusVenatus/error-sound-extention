import * as vscode from "vscode";
import { spawn } from "child_process";

let lastPlayedAt = 0;
let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) outputChannel = vscode.window.createOutputChannel("Error Sound");
  return outputChannel;
}

export function playErrorSound(soundUri: vscode.Uri | undefined): void {
  if (!soundUri) return;

  const now = Date.now();
  if (now - lastPlayedAt < 1500) return;
  lastPlayedAt = now;

  const ch = getOutputChannel();

  if (process.platform !== "win32") {
    ch.appendLine("Non-Windows: skipping sound.");
    return;
  }

  const wavPath = soundUri.fsPath;

  // Use absolute PowerShell path (more reliable than 'powershell.exe' on PATH)
  const ps = `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;

  // Use MediaPlayer + sleeps (SoundPlayer can be flaky when spawned)
  // Escape backslashes for PS string
  const psPath = wavPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const script =
    `Add-Type -AssemblyName presentationCore; ` +
    `$p="${psPath}"; ` +
    `$player=New-Object System.Windows.Media.MediaPlayer; ` +
    `$player.Open([Uri]$p); ` +
    `Start-Sleep -Milliseconds 500; ` +
    `$player.Volume=1.0; ` +
    `$player.Play(); ` +
    `Start-Sleep -Seconds 3;`;

  ch.appendLine(`Playing: ${wavPath}`);

  const child = spawn(
    ps,
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { windowsHide: true } // IMPORTANT: no detached
  );

  child.stdout?.on("data", (d) => ch.appendLine(`stdout: ${String(d)}`));
  child.stderr?.on("data", (d) => ch.appendLine(`stderr: ${String(d)}`));

  child.on("error", (err) => {
    ch.appendLine(`Spawn error: ${err.message}`);
  });

  child.on("exit", (code) => {
    ch.appendLine(`PowerShell exit code: ${code}`);
  });
}