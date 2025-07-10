import { IPty } from 'node-pty';
import { TerminalConfig } from '../types/terminal';

export class TerminalInstance {
  private _pty?: IPty;
  private _isDisposed = false;

  constructor(
    public readonly id: string,
    public readonly config: TerminalConfig
  ) {}

  public setPTY(pty: IPty): void {
    if (this._isDisposed) {
      return;
    }
    this._pty = pty;
  }

  public sendInput(data: string): void {
    if (this._pty && !this._isDisposed) {
      this._pty.write(data);
    }
  }

  public clear(): void {
    if (this._pty && !this._isDisposed) {
      // Send clear command based on OS
      const clearCommand = process.platform === 'win32' ? 'cls\r' : 'clear\r';
      this._pty.write(clearCommand);
    }
  }

  public resize(cols: number, rows: number): void {
    if (this._pty && !this._isDisposed) {
      this._pty.resize(cols, rows);
    }
  }

  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    
    this._isDisposed = true;
    
    if (this._pty) {
      try {
        this._pty.kill();
      } catch (error) {
        console.error('Error killing PTY:', error);
      }
    }
  }

  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  public get pty(): IPty | undefined {
    return this._pty;
  }
}