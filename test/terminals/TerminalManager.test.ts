import { TerminalManager } from '../../src/terminals/TerminalManager';
import * as vscode from 'vscode';

jest.mock('node-pty', () => ({
  spawn: jest.fn(() => ({
    onData: jest.fn(),
    onExit: jest.fn(),
    write: jest.fn(),
    resize: jest.fn(),
    kill: jest.fn()
  }))
}));

describe('TerminalManager', () => {
  let terminalManager: TerminalManager;
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    context = new (vscode as any).ExtensionContext();
    terminalManager = new TerminalManager(context);
  });

  afterEach(() => {
    terminalManager.dispose();
  });

  describe('createTerminal', () => {
    it('should create a new terminal with default config', async () => {
      const terminalId = await terminalManager.createTerminal();
      
      expect(terminalId).toBeTruthy();
      expect(terminalId).toMatch(/^terminal-\d+-\w+$/);
      
      const terminal = terminalManager.getTerminal(terminalId);
      expect(terminal).toBeDefined();
      expect(terminal?.id).toBe(terminalId);
    });

    it('should create a terminal with custom config', async () => {
      const config = {
        shell: '/bin/zsh',
        fontSize: 16,
        fontFamily: 'Fira Code',
        cwd: '/custom/path'
      };
      
      const terminalId = await terminalManager.createTerminal(config);
      const terminal = terminalManager.getTerminal(terminalId);
      
      expect(terminal?.config).toMatchObject(config);
    });
  });

  describe('closeTerminal', () => {
    it('should close and remove a terminal', async () => {
      const terminalId = await terminalManager.createTerminal();
      
      terminalManager.closeTerminal(terminalId);
      
      const terminal = terminalManager.getTerminal(terminalId);
      expect(terminal).toBeUndefined();
    });

    it('should fire closed event when terminal is closed', async () => {
      const terminalId = await terminalManager.createTerminal();
      const closedHandler = jest.fn();
      
      terminalManager.onTerminalClosed(closedHandler);
      terminalManager.closeTerminal(terminalId);
      
      expect(closedHandler).toHaveBeenCalledWith(terminalId);
    });
  });

  describe('sendInput', () => {
    it('should send input to the correct terminal', async () => {
      const terminalId = await terminalManager.createTerminal();
      const terminal = terminalManager.getTerminal(terminalId);
      
      const writeSpy = jest.spyOn(terminal!.pty!, 'write');
      
      terminalManager.sendInput(terminalId, 'test command\n');
      
      expect(writeSpy).toHaveBeenCalledWith('test command\n');
    });
  });

  describe('resizeTerminal', () => {
    it('should resize the terminal', async () => {
      const terminalId = await terminalManager.createTerminal();
      const terminal = terminalManager.getTerminal(terminalId);
      
      const resizeSpy = jest.spyOn(terminal!.pty!, 'resize');
      
      terminalManager.resizeTerminal(terminalId, 120, 40);
      
      expect(resizeSpy).toHaveBeenCalledWith(120, 40);
    });
  });

  describe('getAllTerminals', () => {
    it('should return all active terminals', async () => {
      const id1 = await terminalManager.createTerminal();
      const id2 = await terminalManager.createTerminal();
      
      const terminals = terminalManager.getAllTerminals();
      
      expect(terminals).toHaveLength(2);
      expect(terminals.map(t => t.id)).toContain(id1);
      expect(terminals.map(t => t.id)).toContain(id2);
    });
  });
});