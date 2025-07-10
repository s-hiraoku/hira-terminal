import * as vscode from 'vscode';
import { TerminalInstance } from './TerminalInstance';
import { PTYManager } from './PTYManager';
import { TerminalConfig } from '../types/terminal';

export class TerminalManager {
  private static readonly MAX_TERMINALS = 5;
  private _terminals: Map<string, TerminalInstance> = new Map();
  private _ptyManager: PTYManager;
  private _outputEmitter = new vscode.EventEmitter<{ terminalId: string; data: string }>();
  private _closedEmitter = new vscode.EventEmitter<string>();
  
  public readonly onTerminalOutput = this._outputEmitter.event;
  public readonly onTerminalClosed = this._closedEmitter.event;

  constructor(private context: vscode.ExtensionContext) {
    this._ptyManager = new PTYManager();
  }

  public async createTerminal(config?: TerminalConfig): Promise<string> {
    if (this._terminals.size >= TerminalManager.MAX_TERMINALS) {
      throw new Error(`Maximum number of terminals (${TerminalManager.MAX_TERMINALS}) reached`);
    }

    const terminalId = this._generateId();
    const terminal = new TerminalInstance(terminalId, config || this._getDefaultConfig());
    
    this._terminals.set(terminalId, terminal);
    
    // Set up PTY
    const pty = await this._ptyManager.createPTY(terminal.config);
    terminal.setPTY(pty);
    
    // Listen for output
    pty.onData((data: string) => {
      this._outputEmitter.fire({ terminalId, data });
    });
    
    // Listen for exit
    pty.onExit(() => {
      this.closeTerminal(terminalId);
    });
    
    return terminalId;
  }

  public closeTerminal(terminalId: string): boolean {
    const terminal = this._terminals.get(terminalId);
    if (terminal) {
      terminal.dispose();
      this._terminals.delete(terminalId);
      this._closedEmitter.fire(terminalId);
      return true;
    }
    return false;
  }

  public clearTerminal(terminalId: string): boolean {
    const terminal = this._terminals.get(terminalId);
    if (terminal) {
      terminal.clear();
      return true;
    }
    return false;
  }

  public sendInput(terminalId: string, data: string): boolean {
    const terminal = this._terminals.get(terminalId);
    if (terminal) {
      terminal.sendInput(data);
      return true;
    }
    return false;
  }

  public resizeTerminal(terminalId: string, cols: number, rows: number): boolean {
    const terminal = this._terminals.get(terminalId);
    if (terminal) {
      terminal.resize(cols, rows);
      return true;
    }
    return false;
  }

  public getTerminal(terminalId: string): TerminalInstance | undefined {
    return this._terminals.get(terminalId);
  }

  public getAllTerminals(): TerminalInstance[] {
    return Array.from(this._terminals.values());
  }

  public dispose(): void {
    this._terminals.forEach(terminal => terminal.dispose());
    this._terminals.clear();
    this._ptyManager.dispose();
    this._outputEmitter.dispose();
    this._closedEmitter.dispose();
  }

  private _getDefaultConfig(): TerminalConfig {
    const config = vscode.workspace.getConfiguration('hira-terminal');
    return {
      shell: config.get<string>('defaultShell') || undefined,
      fontSize: config.get<number>('fontSize') || 14,
      fontFamily: config.get<string>('fontFamily') || 'Menlo, Monaco, "Courier New", monospace',
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    };
  }

  private _generateId(): string {
    return `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}