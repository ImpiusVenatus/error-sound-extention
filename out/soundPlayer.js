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
exports.playErrorSound = playErrorSound;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
let lastPlayedAt = 0;
let outputChannel;
function getOutputChannel() {
    if (!outputChannel)
        outputChannel = vscode.window.createOutputChannel("Error Sound");
    return outputChannel;
}
function playErrorSound(soundUri) {
    if (!soundUri)
        return;
    const now = Date.now();
    if (now - lastPlayedAt < 1500)
        return;
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
    const script = `Add-Type -AssemblyName presentationCore; ` +
        `$p="${psPath}"; ` +
        `$player=New-Object System.Windows.Media.MediaPlayer; ` +
        `$player.Open([Uri]$p); ` +
        `Start-Sleep -Milliseconds 500; ` +
        `$player.Volume=1.0; ` +
        `$player.Play(); ` +
        `Start-Sleep -Seconds 3;`;
    ch.appendLine(`Playing: ${wavPath}`);
    const child = (0, child_process_1.spawn)(ps, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { windowsHide: true } // IMPORTANT: no detached
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
//# sourceMappingURL=soundPlayer.js.map