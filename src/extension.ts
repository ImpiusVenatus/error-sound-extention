import * as vscode from 'vscode';
import { playErrorSound } from './soundPlayer';

interface ErrorSoundConfig {
  enableDiagnostics: boolean;
  enableTerminal: boolean;
  terminalPatterns: string[];
}

let config: ErrorSoundConfig = {
  enableDiagnostics: true,
  enableTerminal: true,
  terminalPatterns: []
};

let soundUri: vscode.Uri | undefined;
let terminalRegexes: RegExp[] = [];
const fileHasError = new Map<string, boolean>();
const terminalBuffers = new Map<string, string>();

function loadConfig(): void {
  const cfg = vscode.workspace.getConfiguration('errorSound');

  config = {
    enableDiagnostics: cfg.get<boolean>('enableDiagnostics', true),
    enableTerminal: cfg.get<boolean>('enableTerminal', true),
    terminalPatterns: cfg.get<string[]>('terminalPatterns', [
      'error',
      'exception',
      '\\b(4\\d{2}|5\\d{2})\\b'
    ])
  };

  terminalRegexes = [];
  for (const pattern of config.terminalPatterns) {
    try {
      terminalRegexes.push(new RegExp(pattern, 'i'));
    } catch {
      // Ignore invalid regex patterns.
    }
  }
}

function handleDiagnosticsChange(uris: readonly vscode.Uri[]): void {
  if (!config.enableDiagnostics) {
    return;
  }

  for (const uri of uris) {
    const key = uri.toString();
    const diagnostics = vscode.languages.getDiagnostics(uri);
    const hasError = diagnostics.some((d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Error);
    const prev = fileHasError.get(key) ?? false;
    fileHasError.set(key, hasError);

    if (hasError && !prev) {
      playErrorSound(soundUri);
    }
  }
}

function handleTerminalData(event: { terminal: vscode.Terminal | undefined; data?: string }): void {
  if (!config.enableTerminal || !soundUri || terminalRegexes.length === 0) {
    return;
  }

  const terminal = event.terminal;
  if (!terminal) {
    return;
  }

  const id = terminal.name || 'default';
  const data: string = event.data ?? '';
  if (!data) {
    return;
  }

  const previous = terminalBuffers.get(id) ?? '';
  const combined = previous + data;
  const lines = combined.split(/\r?\n/);
  const remainder = lines.pop() ?? '';
  terminalBuffers.set(id, remainder);

  for (const line of lines) {
    if (!line) {
      continue;
    }
    if (terminalRegexes.some(regex => regex.test(line))) {
      playErrorSound(soundUri);
      break;
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  // Bundled sound file in the extension root.
  soundUri = vscode.Uri.joinPath(context.extensionUri, 'FAHHH (Meme Sound Effect).mp3');
  loadConfig();

  const diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics((e: vscode.DiagnosticChangeEvent) => {
    handleDiagnosticsChange(e.uris);
  });

  // Terminal data event is available in newer VS Code / Cursor versions.
  const windowAny = vscode.window as any;
  if (typeof windowAny.onDidWriteTerminalData === 'function') {
    const terminalSubscription = windowAny.onDidWriteTerminalData((event: { terminal: vscode.Terminal | undefined; data?: string }) => {
      handleTerminalData(event);
    });
    context.subscriptions.push(terminalSubscription);
  }

  const configSubscription = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
    if (e.affectsConfiguration('errorSound')) {
      loadConfig();
    }
  });

  const testCommand = vscode.commands.registerCommand('errorSound.playTestSound', () => {
    if (!soundUri) {
      vscode.window.showWarningMessage('Error Sound: bundled sound file could not be resolved.');
      return;
    }
    playErrorSound(soundUri);
  });

  context.subscriptions.push(
    diagnosticsSubscription,
    configSubscription,
    testCommand
  );
}

export function deactivate(): void {
  // Nothing to clean up explicitly; subscriptions are disposed via context.
}

