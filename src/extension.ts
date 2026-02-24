import * as vscode from 'vscode';
import { playErrorSound } from './soundPlayer';

interface ErrorSoundConfig {
  enableDiagnostics: boolean;
}

let config: ErrorSoundConfig = {
  enableDiagnostics: true
};

let soundUri: vscode.Uri | undefined;
const fileHasError = new Map<string, boolean>();

function loadConfig(): void {
  const cfg = vscode.workspace.getConfiguration('errorSound');

  config = {
    enableDiagnostics: cfg.get<boolean>('enableDiagnostics', true)
  };
}

function handleDiagnosticsChange(uris: readonly vscode.Uri[]): void {
  if (!config.enableDiagnostics) {
    return;
  }

  for (const uri of uris) {
    const key = uri.toString();
    const diagnostics = vscode.languages.getDiagnostics(uri);
    const hasError = diagnostics.some(
      (d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Error
    );
    const prev = fileHasError.get(key) ?? false;
    fileHasError.set(key, hasError);

    if (hasError && !prev) {
      playErrorSound(soundUri);
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  // Bundled sound file in the extension root.
  soundUri = vscode.Uri.joinPath(
    context.extensionUri,
    'FAHHH.wav'
  );

  if (soundUri) {
    vscode.workspace.fs.stat(soundUri).then(
      () => {
        // File exists; nothing else to do.
      },
      () => {
        soundUri = undefined;
        vscode.window.showWarningMessage(
          'Error Sound: bundled WAV file could not be found; sound playback is disabled.'
        );
      }
    );
  }

  loadConfig();

  const diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics(
    (e: vscode.DiagnosticChangeEvent) => {
      handleDiagnosticsChange(e.uris);
    }
  );

  const configSubscription = vscode.workspace.onDidChangeConfiguration(
    (e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('errorSound')) {
        loadConfig();
      }
    }
  );

  const testCommand = vscode.commands.registerCommand(
    'errorSound.playTestSound',
    () => {
      if (!soundUri) {
        vscode.window.showWarningMessage(
          'Error Sound: bundled sound file could not be resolved.'
        );
        return;
      }
      vscode.window.showInformationMessage(`Sound path: ${soundUri.fsPath}`);
      playErrorSound(soundUri);
    }
  );

  context.subscriptions.push(
    diagnosticsSubscription,
    configSubscription,
    testCommand
  );
}

export function deactivate(): void {
  // Nothing to clean up explicitly; subscriptions are disposed via context.
}

