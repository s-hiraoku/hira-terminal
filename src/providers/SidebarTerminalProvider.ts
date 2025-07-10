import * as vscode from 'vscode';
import { TerminalManager } from '../terminals/TerminalManager';

export class SidebarTerminalProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'hira-terminal.sidebarView';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _terminalManager: TerminalManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'createTerminal':
          await this.createNewTerminal(message.config);
          break;
        case 'closeTerminal':
          this._terminalManager.closeTerminal(message.terminalId);
          break;
        case 'clearTerminal':
          this._terminalManager.clearTerminal(message.terminalId);
          break;
        case 'sendInput':
          this._terminalManager.sendInput(message.terminalId, message.data);
          break;
        case 'resizeTerminal':
          this._terminalManager.resizeTerminal(message.terminalId, message.cols, message.rows);
          break;
        case 'setActiveTerminal':
          this._terminalManager.setActiveTerminal(message.terminalId);
          break;
      }
    });

    // Listen for terminal output
    this._terminalManager.onTerminalOutput((data) => {
      this._view?.webview.postMessage({
        command: 'terminalOutput',
        terminalId: data.terminalId,
        data: data.data
      });
    });

    // Listen for terminal close
    this._terminalManager.onTerminalClosed((terminalId) => {
      this._view?.webview.postMessage({
        command: 'terminalClosed',
        terminalId
      });
    });
  }

  public async createNewTerminal(config?: any) {
    const terminalId = await this._terminalManager.createTerminal(config);
    
    this._view?.webview.postMessage({
      command: 'terminalCreated',
      terminalId,
      config
    });

    return terminalId;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'style.css'));
    
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>Hira Terminal</title>
      </head>
      <body>
        <div id="terminal-container"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  private _getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}