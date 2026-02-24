"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const soundPlayer_1 = require("./soundPlayer");
let config = {
    filePath: '',
    enableDiagnostics: true,
    enableTerminal: true,
    terminalPatterns: []
};
let soundUri;
let warnedMissingSound = false;
let terminalRegexes = [];
const fileHasError = new Map();
const terminalBuffers = new Map();
function loadConfig() {
    const cfg = vscode.workspace.getConfiguration('errorSound');
    config = {
        filePath: cfg.get('filePath', ''),
        enableDiagnostics: cfg.get('enableDiagnostics', true),
        enableTerminal: cfg.get('enableTerminal', true),
        terminalPatterns: cfg.get('terminalPatterns', [
            'error',
            'exception',
            '\\b(4\\d{2}|5\\d{2})\\b'
        ])
    };
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length || !config.filePath) {
        soundUri = undefined;
        if (!warnedMissingSound) {
            warnedMissingSound = true;
            vscode.window.showWarningMessage('Error Sound: workspace folder or errorSound.filePath is not set; sound playback is disabled.');
        }
    }
    else {
        soundUri = vscode.Uri.joinPath(folders[0].uri, config.filePath);
    }
    terminalRegexes = [];
    for (const pattern of config.terminalPatterns) {
        try {
            terminalRegexes.push(new RegExp(pattern, 'i'));
        }
        catch {
            // Ignore invalid regex patterns.
        }
    }
}
function handleDiagnosticsChange(uris) {
    if (!config.enableDiagnostics) {
        return;
    }
    for (const uri of uris) {
        const key = uri.toString();
        const diagnostics = vscode.languages.getDiagnostics(uri);
        const hasError = diagnostics.some((d) => d.severity === vscode.DiagnosticSeverity.Error);
        const prev = fileHasError.get(key) ?? false;
        fileHasError.set(key, hasError);
        if (hasError && !prev) {
            (0, soundPlayer_1.playErrorSound)(soundUri);
        }
    }
}
function handleTerminalData(event) {
    if (!config.enableTerminal || !soundUri || terminalRegexes.length === 0) {
        return;
    }
    const terminal = event.terminal;
    if (!terminal) {
        return;
    }
    const id = terminal.name || 'default';
    const data = event.data ?? '';
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
            (0, soundPlayer_1.playErrorSound)(soundUri);
            break;
        }
    }
}
function activate(context) {
    loadConfig();
    const diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics((e) => {
        handleDiagnosticsChange(e.uris);
    });
    // Terminal data event is available in newer VS Code / Cursor versions.
    const windowAny = vscode.window;
    if (typeof windowAny.onDidWriteTerminalData === 'function') {
        const terminalSubscription = windowAny.onDidWriteTerminalData((event) => {
            handleTerminalData(event);
        });
        context.subscriptions.push(terminalSubscription);
    }
    const configSubscription = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('errorSound')) {
            loadConfig();
        }
    });
    const testCommand = vscode.commands.registerCommand('errorSound.playTestSound', () => {
        if (!soundUri) {
            vscode.window.showWarningMessage('Error Sound: sound file is not configured or workspace folder is missing.');
            return;
        }
        (0, soundPlayer_1.playErrorSound)(soundUri);
    });
    context.subscriptions.push(diagnosticsSubscription, configSubscription, testCommand);
}
function deactivate() {
    // Nothing to clean up explicitly; subscriptions are disposed via context.
}
//# sourceMappingURL=extension.js.map