import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { TerminalSplitView } from './components/TerminalSplitView';

declare const acquireVsCodeApi: () => any;
const vscode = acquireVsCodeApi();

class TerminalWebview {
  private terminals: Map<string, Terminal> = new Map();
  private splitView: TerminalSplitView;
  private activeTerminalId?: string;

  constructor() {
    this.splitView = new TerminalSplitView(document.getElementById('terminal-container')!);
    this.initializeMessageHandlers();
    this.requestInitialState();
  }

  private initializeMessageHandlers(): void {
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.command) {
        case 'terminalCreated':
          this.createTerminalView(message.terminalId, message.config);
          break;
        case 'terminalOutput':
          this.handleTerminalOutput(message.terminalId, message.data);
          break;
        case 'terminalClosed':
          this.closeTerminalView(message.terminalId);
          break;
      }
    });
  }

  private createTerminalView(terminalId: string, config: any): void {
    const terminal = new Terminal({
      fontSize: config?.fontSize || 14,
      fontFamily: config?.fontFamily || 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      allowProposedApi: true,
      cursorBlink: true
    });

    // Add addons
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    // Create container for terminal
    const container = this.splitView.addTerminal(terminalId);
    terminal.open(container);
    fitAddon.fit();

    // Handle terminal input
    terminal.onData((data: string) => {
      vscode.postMessage({
        command: 'sendInput',
        terminalId: terminalId,
        data: data
      });
    });

    // Handle resize
    terminal.onResize((size: { cols: number; rows: number }) => {
      vscode.postMessage({
        command: 'resizeTerminal',
        terminalId: terminalId,
        cols: size.cols,
        rows: size.rows
      });
    });

    // Handle focus (set as active terminal)
    terminal.onFocus(() => {
      vscode.postMessage({
        command: 'setActiveTerminal',
        terminalId: terminalId
      });
    });

    // Store terminal
    this.terminals.set(terminalId, terminal);
    this.activeTerminalId = terminalId;

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);
  }

  private handleTerminalOutput(terminalId: string, data: string): void {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.write(data);
    }
  }

  private closeTerminalView(terminalId: string): void {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.dispose();
      this.terminals.delete(terminalId);
      this.splitView.removeTerminal(terminalId);
      
      if (this.activeTerminalId === terminalId) {
        this.activeTerminalId = undefined;
      }
    }
  }

  private requestInitialState(): void {
    vscode.postMessage({ command: 'requestState' });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TerminalWebview());
} else {
  new TerminalWebview();
}