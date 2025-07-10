import { TerminalConfig } from '../types/terminal';
import * as os from 'os';
import * as vscode from 'vscode';
import { MockPTY, MockIPty } from './MockPTY';

// Conditional import for node-pty
let nodePty: any = null;
try {
  nodePty = require('node-pty');
} catch (error) {
  console.warn('node-pty not available, using fallback implementation');
}

export class PTYManager {
  private _ptys: Set<MockIPty> = new Set();
  private _useNativePty: boolean = false;

  constructor() {
    // Check if native node-pty is available
    this._useNativePty = nodePty !== null;
  }

  public async createPTY(config: TerminalConfig): Promise<MockIPty> {
    try {
      const shell = config.shell || this._getDefaultShell();
      const env = this._getEnvironment();
      
      let ptyProcess: MockIPty;

      if (this._useNativePty && nodePty) {
        // Try native node-pty first
        try {
          const nativePty = nodePty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: config.cwd || os.homedir(),
            env: env as any
          });
          
          // Wrap native PTY to match our interface
          ptyProcess = this._wrapNativePty(nativePty);
        } catch (nativeError) {
          console.warn('Native node-pty failed, falling back to mock:', nativeError);
          this._useNativePty = false;
          ptyProcess = new MockPTY(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: config.cwd || os.homedir(),
            env: env as any
          });
        }
      } else {
        // Use mock PTY
        ptyProcess = new MockPTY(shell, [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: config.cwd || os.homedir(),
          env: env as any
        });
      }

      this._ptys.add(ptyProcess);

      // Clean up on exit
      ptyProcess.onExit(() => {
        this._ptys.delete(ptyProcess);
      });

      return ptyProcess;
    } catch (error) {
      console.error('Failed to create PTY process:', error);
      vscode.window.showErrorMessage(
        'Failed to create terminal process. Please check your shell configuration.'
      );
      throw error;
    }
  }

  public dispose(): void {
    this._ptys.forEach(ptyProcess => {
      try {
        ptyProcess.kill();
      } catch (error) {
        console.error('Error killing PTY process:', error);
      }
    });
    this._ptys.clear();
  }


  private _wrapNativePty(nativePty: any): MockIPty {
    const wrapped = new MockPTY(process.env.SHELL || '/bin/bash');
    
    // Override methods to use native PTY
    wrapped.write = (data: string) => nativePty.write(data);
    wrapped.resize = (cols: number, rows: number) => nativePty.resize(cols, rows);
    wrapped.kill = () => nativePty.kill();
    
    // Forward events
    nativePty.onData((data: string) => wrapped.emit('data', data));
    nativePty.onExit((code: number, signal: number) => wrapped.emit('exit', code, signal));
    
    return wrapped;
  }

  private _getDefaultShell(): string {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/bash';
  }

  private _getEnvironment(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    
    // Add or modify environment variables as needed
    env.TERM = 'xterm-256color';
    env.COLORTERM = 'truecolor';
    
    // Remove some VS Code specific variables that might interfere
    delete env.ELECTRON_RUN_AS_NODE;
    
    return env;
  }
}