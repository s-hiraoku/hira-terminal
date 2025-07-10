# Hira Terminal Architecture Design Document

Based on VS Code's Terminal Implementation Patterns

## Overview

This document outlines the architecture design for Hira Terminal, a VS Code extension that provides terminal instances in a sidebar. The design is based on extensive research of VS Code's official terminal implementation, focusing on proven patterns and best practices.

## Core Architecture Components

### 1. Terminal Instance Management

Following VS Code's pattern, we'll implement a layered architecture:

```typescript
// Core interfaces based on VS Code patterns
interface IHiraTerminalService {
  readonly instances: ReadonlyArray<IHiraTerminalInstance>;
  readonly activeInstance: IHiraTerminalInstance | undefined;
  
  createTerminal(options?: ITerminalOptions): Promise<IHiraTerminalInstance>;
  disposeTerminal(instance: IHiraTerminalInstance): void;
  setActiveInstance(instance: IHiraTerminalInstance): void;
  focusActiveInstance(): void;
}

interface IHiraTerminalInstance {
  readonly id: string;
  readonly title: string;
  readonly processId: number | undefined;
  readonly exitCode: number | undefined;
  
  focus(): void;
  sendText(text: string, addNewLine?: boolean): void;
  dispose(): void;
  
  // Events
  readonly onDidFocus: Event<void>;
  readonly onDidBlur: Event<void>;
  readonly onProcessIdReady: Event<number>;
  readonly onProcessExit: Event<number | undefined>;
}
```

### 2. Focus Management System

Based on VS Code's context key pattern:

```typescript
// Context keys for terminal state management
export const HiraTerminalContextKeys = {
  focus: new RawContextKey<boolean>('hiraTerminal.focus', false),
  count: new RawContextKey<number>('hiraTerminal.count', 0),
  processSupported: new RawContextKey<boolean>('hiraTerminal.processSupported', true),
  terminalHasBeenCreated: new RawContextKey<boolean>('hiraTerminal.hasBeenCreated', false),
  textSelected: new RawContextKey<boolean>('hiraTerminal.textSelected', false),
  altBufferActive: new RawContextKey<boolean>('hiraTerminal.altBufferActive', false),
};

class HiraTerminalInstance {
  private _terminalFocusContextKey: IContextKey<boolean>;
  private _terminalHasTextContextKey: IContextKey<boolean>;
  
  constructor(
    private readonly _contextKeyService: IContextKeyService
  ) {
    this._terminalFocusContextKey = HiraTerminalContextKeys.focus.bindTo(_contextKeyService);
    this._terminalHasTextContextKey = HiraTerminalContextKeys.textSelected.bindTo(_contextKeyService);
  }
  
  private _setFocus(focused: boolean): void {
    this._terminalFocusContextKey.set(focused);
    
    if (focused) {
      this._onDidFocus.fire();
    } else {
      this._onDidBlur.fire();
      this._refreshSelectionContextKey();
    }
  }
}
```

### 3. PTY Communication Architecture

Following VS Code's multi-process pattern:

```typescript
// Renderer Process (Extension Host)
class HiraTerminalProcessManager {
  private _process: ITerminalProcessProxy | undefined;
  
  async createProcess(shellLaunchConfig: IShellLaunchConfig): Promise<void> {
    // Communicate with PTY service via IPC
    this._process = await this._ptyService.createProcess(
      shellLaunchConfig,
      this._cols,
      this._rows
    );
    
    // Set up bidirectional communication
    this._process.onProcessData((data) => {
      this._onProcessData.fire(data);
    });
    
    this._process.onProcessExit((exitCode) => {
      this._onProcessExit.fire(exitCode);
    });
  }
  
  write(data: string): void {
    this._process?.input(data);
  }
}

// PTY Host Process (Separate process for isolation)
interface IPtyService {
  createProcess(config: IShellLaunchConfig, cols: number, rows: number): Promise<ITerminalProcessProxy>;
  input(id: string, data: string): void;
  resize(id: string, cols: number, rows: number): void;
  shutdown(id: string): void;
}
```

### 4. Keyboard Event Handling

Implementing VS Code's keyboard interception pattern:

```typescript
class HiraTerminalInstance {
  private _attachKeyboardListeners(): void {
    this._xterm.attachCustomKeyEventHandler((event: KeyboardEvent): boolean => {
      // 1. Check if terminal is exiting
      if (this._isExiting) {
        return false;
      }
      
      // 2. Check for VS Code keybindings
      const resolvedKeybinding = this._keybindingService.softDispatch(event, event.target);
      
      // 3. Handle chord mode
      if (this._keybindingService.inChordMode || resolvedKeybinding?.commandId) {
        if (this._configService.getValue('hiraTerminal.allowChords')) {
          event.preventDefault();
          return false;
        }
      }
      
      // 4. Check commands to skip
      if (this._shouldSkipCommand(resolvedKeybinding?.commandId)) {
        event.preventDefault();
        return false;
      }
      
      // 5. Handle special keys (Tab focus mode, Shift+Tab, etc.)
      if (this._handleSpecialKeys(event)) {
        return false;
      }
      
      // Allow normal terminal input
      return true;
    });
  }
  
  private _shouldSkipCommand(commandId: string | undefined): boolean {
    if (!commandId) return false;
    
    const skipCommands = this._configService.getValue<string[]>('hiraTerminal.commandsToSkipShell');
    return skipCommands.includes(commandId) && 
           !this._configService.getValue('hiraTerminal.sendKeybindingsToShell');
  }
}
```

### 5. Split Terminal Implementation

Based on VS Code's terminal group pattern:

```typescript
interface IHiraTerminalGroup {
  readonly instances: ReadonlyArray<IHiraTerminalInstance>;
  readonly activeInstance: IHiraTerminalInstance | undefined;
  
  addInstance(instance: IHiraTerminalInstance): void;
  removeInstance(instance: IHiraTerminalInstance): void;
  split(instance: IHiraTerminalInstance): IHiraTerminalInstance;
  
  focusNext(): void;
  focusPrevious(): void;
  resizePane(direction: Direction, amount: number): void;
}

class HiraTerminalService {
  async splitTerminal(instance?: IHiraTerminalInstance): Promise<IHiraTerminalInstance> {
    const activeInstance = instance || this.activeInstance;
    if (!activeInstance) {
      throw new Error('No active terminal to split');
    }
    
    // Create new instance with parent's working directory
    const parentCwd = await activeInstance.getCwd();
    const newInstance = await this.createTerminal({
      cwd: parentCwd,
      parentTerminal: activeInstance
    });
    
    // Add to same group as parent
    const group = this._getGroupForInstance(activeInstance);
    group.addInstance(newInstance);
    
    // Focus the new instance
    newInstance.focus();
    
    return newInstance;
  }
}
```

### 6. Terminal Lifecycle Management

```typescript
class HiraTerminalInstance {
  private _isDisposed = false;
  private _isExiting = false;
  private _exitCode: number | undefined;
  
  constructor(
    private readonly _id: string,
    private readonly _configService: IConfigurationService,
    private readonly _contextKeyService: IContextKeyService
  ) {
    this._register(this._processManager.onProcessExit((exitCode) => {
      this._isExiting = true;
      this._exitCode = exitCode;
      this._onProcessExit.fire(exitCode);
      
      // Handle disposal based on configuration
      if (this._configService.getValue('hiraTerminal.autoCloseOnExit')) {
        this.dispose();
      }
    }));
  }
  
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    
    this._isDisposed = true;
    
    // Clean up resources
    this._processManager.dispose();
    this._xterm.dispose();
    this._resetFocusContextKey();
    
    // Fire disposal event
    this._onDisposed.fire();
    
    super.dispose();
  }
}
```

## Webview Terminal Integration

Since Hira Terminal uses a webview for the sidebar, we need special handling:

### 1. Webview-Extension Communication

```typescript
// Extension side
class HiraTerminalWebviewProvider implements vscode.WebviewViewProvider {
  private _webview?: vscode.Webview;
  
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._webview = webviewView.webview;
    
    // Set up message handling
    this._webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'terminal-input':
          this._handleTerminalInput(message.terminalId, message.data);
          break;
        case 'terminal-resize':
          this._handleTerminalResize(message.terminalId, message.cols, message.rows);
          break;
        case 'terminal-focus':
          this._handleTerminalFocus(message.terminalId);
          break;
      }
    });
  }
  
  // Send terminal output to webview
  sendTerminalData(terminalId: string, data: string): void {
    this._webview?.postMessage({
      command: 'terminal-data',
      terminalId,
      data
    });
  }
}

// Webview side
class WebviewTerminalManager {
  private terminals = new Map<string, Terminal>();
  
  createTerminal(terminalId: string, container: HTMLElement): void {
    const terminal = new Terminal({
      fontFamily: this.getFontFamily(),
      fontSize: this.getFontSize(),
      theme: this.getTheme()
    });
    
    terminal.open(container);
    
    // Set up event handlers
    terminal.onData((data) => {
      vscode.postMessage({
        command: 'terminal-input',
        terminalId,
        data
      });
    });
    
    terminal.onResize((size) => {
      vscode.postMessage({
        command: 'terminal-resize',
        terminalId,
        cols: size.cols,
        rows: size.rows
      });
    });
    
    this.terminals.set(terminalId, terminal);
  }
}
```

### 2. Security Considerations

```typescript
// Content Security Policy for webview
function getWebviewContent(webview: vscode.Webview): string {
  const xtermUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'xterm', 'lib', 'xterm.js'));
  
  return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline';">
      <link rel="stylesheet" href="${xtermCssUri}">
    </head>
    <body>
      <div id="terminal-container"></div>
      <script src="${xtermUri}"></script>
      <script src="${webviewScriptUri}"></script>
    </body>
    </html>`;
}
```

## Terminal Actions Architecture

Based on VS Code's action pattern:

```typescript
// Register terminal actions
export function registerHiraTerminalActions(): void {
  // New Terminal
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: 'hiraTerminal.new',
        title: 'New Terminal',
        f1: true,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Backquote
        }
      });
    }
    
    run(accessor: ServicesAccessor): void {
      const terminalService = accessor.get(IHiraTerminalService);
      terminalService.createTerminal();
    }
  });
  
  // Kill Terminal
  registerActiveInstanceAction({
    id: 'hiraTerminal.kill',
    title: 'Kill Terminal',
    precondition: ContextKeyExpr.or(HiraTerminalContextKeys.processSupported, HiraTerminalContextKeys.terminalHasBeenCreated),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.KEY_W,
      when: HiraTerminalContextKeys.focus
    },
    run: (instance) => instance.dispose()
  });
  
  // Split Terminal
  registerActiveInstanceAction({
    id: 'hiraTerminal.split',
    title: 'Split Terminal',
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_5,
      when: HiraTerminalContextKeys.focus
    },
    run: async (instance, accessor) => {
      const terminalService = accessor.get(IHiraTerminalService);
      await terminalService.splitTerminal(instance);
    }
  });
}
```

## Configuration Schema

```typescript
export const terminalConfiguration: IConfigurationNode = {
  id: 'hiraTerminal',
  order: 100,
  title: 'Hira Terminal',
  type: 'object',
  properties: {
    'hiraTerminal.defaultShell': {
      type: ['string', 'null'],
      default: null,
      description: 'Default shell to use for new terminals'
    },
    'hiraTerminal.sendKeybindingsToShell': {
      type: 'boolean',
      default: false,
      description: 'Send VS Code keybindings to the terminal instead of the workbench'
    },
    'hiraTerminal.commandsToSkipShell': {
      type: 'array',
      items: { type: 'string' },
      default: [
        'workbench.action.toggleSidebarVisibility',
        'workbench.action.quickOpen',
        'workbench.action.terminal.copySelection'
      ],
      description: 'Commands that should skip the terminal and be handled by VS Code'
    },
    'hiraTerminal.allowChords': {
      type: 'boolean',
      default: true,
      description: 'Allow chord keybindings in the terminal'
    },
    'hiraTerminal.autoCloseOnExit': {
      type: 'boolean',
      default: false,
      description: 'Automatically close terminal when process exits'
    }
  }
};
```

## Performance Considerations

1. **Lazy Loading**: Load xterm.js and addons only when first terminal is created
2. **Terminal Pooling**: Reuse disposed terminal instances to avoid recreation overhead
3. **Debounced Resize**: Debounce terminal resize events to prevent excessive reflows
4. **Virtual Scrolling**: Use xterm.js's built-in virtual scrolling for large outputs
5. **Process Output Buffering**: Buffer process output before sending to webview

## Testing Strategy

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test terminal lifecycle and PTY communication
3. **E2E Tests**: Test user interactions through VS Code's testing API
4. **Performance Tests**: Monitor terminal creation time and memory usage

## Security Considerations

1. **Process Isolation**: Run PTY processes in separate process for security
2. **Input Sanitization**: Sanitize all input before sending to PTY
3. **CSP Headers**: Use strict Content Security Policy in webview
4. **Command Validation**: Validate all commands before execution

## Future Enhancements

1. **Terminal Profiles**: Support for predefined terminal configurations
2. **Search Functionality**: Implement find/search within terminal output
3. **Terminal Replay**: Record and replay terminal sessions
4. **Remote Terminal Support**: Connect to remote terminals via SSH
5. **Terminal Sharing**: Share terminal sessions with other users

## Summary

This architecture design follows VS Code's proven patterns for terminal implementation while adapting them for use in a webview-based sidebar extension. The key principles are:

- **Separation of Concerns**: Clear boundaries between UI, business logic, and process management
- **Event-Driven Architecture**: Use events for loose coupling between components
- **Context-Based State Management**: Use context keys for UI state and command enablement
- **Security First**: Isolate processes and sanitize all inputs
- **Performance Optimized**: Lazy loading, pooling, and efficient data transfer

By following these patterns, Hira Terminal can provide a robust, secure, and performant terminal experience within VS Code's sidebar.