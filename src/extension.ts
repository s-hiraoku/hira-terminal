import * as vscode from 'vscode';
import { SidebarTerminalProvider } from './providers/SidebarTerminalProvider';
import { TerminalManager } from './terminals/TerminalManager';

let terminalManager: TerminalManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('Hira Terminal extension is now active!');

  // Initialize terminal manager
  terminalManager = new TerminalManager(context);

  // Register sidebar webview provider
  const provider = new SidebarTerminalProvider(context.extensionUri, terminalManager);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarTerminalProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('hira-terminal.newTerminal', () => {
      provider.createNewTerminal();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('hira-terminal.closeTerminal', (terminalId: string) => {
      terminalManager.closeTerminal(terminalId);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('hira-terminal.clearTerminal', (terminalId: string) => {
      terminalManager.clearTerminal(terminalId);
    })
  );
}

export function deactivate() {
  if (terminalManager) {
    terminalManager.dispose();
  }
}