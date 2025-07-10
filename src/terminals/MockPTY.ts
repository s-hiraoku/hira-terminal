import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as os from 'os';

export interface MockIPty extends EventEmitter {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onData(callback: (data: string) => void): void;
  onExit(callback: (exitCode?: number, signal?: number) => void): void;
  pid: number;
}

export class MockPTY extends EventEmitter implements MockIPty {
  private _process: ChildProcess;
  private _cols: number = 80;
  private _rows: number = 30;

  constructor(
    shell: string,
    args: string[] = [],
    options: {
      name?: string;
      cols?: number;
      rows?: number;
      cwd?: string;
      env?: any;
    } = {}
  ) {
    super();

    this._cols = options.cols || 80;
    this._rows = options.rows || 30;

    // Use regular child_process spawn
    this._process = spawn(shell, args, {
      cwd: options.cwd || os.homedir(),
      env: options.env || process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Set up event forwarding
    this._process.stdout?.on('data', (data) => {
      this.emit('data', data.toString());
    });

    this._process.stderr?.on('data', (data) => {
      this.emit('data', data.toString());
    });

    this._process.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });

    this._process.on('error', (error) => {
      this.emit('error', error);
    });
  }

  get pid(): number {
    return this._process.pid || 0;
  }

  write(data: string): void {
    if (this._process.stdin) {
      this._process.stdin.write(data);
    }
  }

  resize(cols: number, rows: number): void {
    this._cols = cols;
    this._rows = rows;
    // Note: Regular child_process doesn't support resize
    // This is a limitation of the mock implementation
  }

  kill(): void {
    if (this._process) {
      this._process.kill();
    }
  }

  onData(callback: (data: string) => void): void {
    this.on('data', callback);
  }

  onExit(callback: (exitCode?: number, signal?: number) => void): void {
    this.on('exit', callback);
  }
}