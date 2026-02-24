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
    enableDiagnostics: true
};
let soundUri;
const fileHasError = new Map();
function loadConfig() {
    const cfg = vscode.workspace.getConfiguration('errorSound');
    config = {
        enableDiagnostics: cfg.get('enableDiagnostics', true)
    };
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
function activate(context) {
    // Bundled sound file in the extension root.
    soundUri = vscode.Uri.joinPath(context.extensionUri, 'FAHHH.wav');
    if (soundUri) {
        vscode.workspace.fs.stat(soundUri).then(() => {
            // File exists; nothing else to do.
        }, () => {
            soundUri = undefined;
            vscode.window.showWarningMessage('Error Sound: bundled WAV file could not be found; sound playback is disabled.');
        });
    }
    loadConfig();
    const diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics((e) => {
        handleDiagnosticsChange(e.uris);
    });
    const configSubscription = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('errorSound')) {
            loadConfig();
        }
    });
    const testCommand = vscode.commands.registerCommand('errorSound.playTestSound', () => {
        if (!soundUri) {
            vscode.window.showWarningMessage('Error Sound: bundled sound file could not be resolved.');
            return;
        }
        vscode.window.showInformationMessage(`Sound path: ${soundUri.fsPath}`);
        (0, soundPlayer_1.playErrorSound)(soundUri);
    });
    context.subscriptions.push(diagnosticsSubscription, configSubscription, testCommand);
}
function deactivate() {
    // Nothing to clean up explicitly; subscriptions are disposed via context.
}
//# sourceMappingURL=extension.js.map