import * as pty from 'node-pty';
import { IPty } from 'node-pty';
import { TerminalConfig } from '../types/terminal';
import * as os from 'os';

export class PTYManager {
  private _ptys: Set<IPty> = new Set();

  public async createPTY(config: TerminalConfig): Promise<IPty> {
    const shell = config.shell || this._getDefaultShell();
    const env = this._getEnvironment();
    
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: config.cwd || os.homedir(),
      env: env as any
    });

    this._ptys.add(ptyProcess);

    // Clean up on exit
    ptyProcess.onExit(() => {
      this._ptys.delete(ptyProcess);
    });

    return ptyProcess;
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