# API Documentation

## Commands

### `hira-terminal.newTerminal`
Creates a new terminal instance in the sidebar.

**Usage:**
```typescript
vscode.commands.executeCommand('hira-terminal.newTerminal');
```

### `hira-terminal.closeTerminal`
Closes a specific terminal instance.

**Parameters:**
- `terminalId: string` - The ID of the terminal to close

**Usage:**
```typescript
vscode.commands.executeCommand('hira-terminal.closeTerminal', terminalId);
```

### `hira-terminal.clearTerminal`
Clears the output of a specific terminal.

**Parameters:**
- `terminalId: string` - The ID of the terminal to clear

**Usage:**
```typescript
vscode.commands.executeCommand('hira-terminal.clearTerminal', terminalId);
```

## Configuration

### `hira-terminal.defaultShell`
**Type:** `string`  
**Default:** `""`  
**Description:** Default shell to use for new terminals. Leave empty to use system default.

### `hira-terminal.fontSize`
**Type:** `number`  
**Default:** `14`  
**Description:** Terminal font size in pixels.

### `hira-terminal.fontFamily`
**Type:** `string`  
**Default:** `"Menlo, Monaco, 'Courier New', monospace"`  
**Description:** Terminal font family.

## Extension API

### TerminalManager

```typescript
class TerminalManager {
  // Create a new terminal
  createTerminal(config?: TerminalConfig): Promise<string>;
  
  // Close a terminal
  closeTerminal(terminalId: string): void;
  
  // Clear terminal output
  clearTerminal(terminalId: string): void;
  
  // Send input to terminal
  sendInput(terminalId: string, data: string): void;
  
  // Resize terminal
  resizeTerminal(terminalId: string, cols: number, rows: number): void;
  
  // Get a specific terminal
  getTerminal(terminalId: string): TerminalInstance | undefined;
  
  // Get all terminals
  getAllTerminals(): TerminalInstance[];
  
  // Events
  onTerminalOutput: Event<{ terminalId: string; data: string }>;
  onTerminalClosed: Event<string>;
}
```

### TerminalConfig

```typescript
interface TerminalConfig {
  shell?: string;          // Shell executable path
  cwd?: string;           // Working directory
  env?: Record<string, string>;  // Environment variables
  fontSize?: number;      // Font size
  fontFamily?: string;    // Font family
  theme?: TerminalTheme;  // Color theme
}
```

### TerminalTheme

```typescript
interface TerminalTheme {
  background?: string;
  foreground?: string;
  cursor?: string;
  selection?: string;
  black?: string;
  red?: string;
  green?: string;
  yellow?: string;
  blue?: string;
  magenta?: string;
  cyan?: string;
  white?: string;
  brightBlack?: string;
  brightRed?: string;
  brightGreen?: string;
  brightYellow?: string;
  brightBlue?: string;
  brightMagenta?: string;
  brightCyan?: string;
  brightWhite?: string;
}
```

## Webview API

### Message Protocol

#### Extension → Webview

```typescript
// Terminal created
{
  command: 'terminalCreated',
  terminalId: string,
  config?: TerminalConfig
}

// Terminal output
{
  command: 'terminalOutput',
  terminalId: string,
  data: string
}

// Terminal closed
{
  command: 'terminalClosed',
  terminalId: string
}
```

#### Webview → Extension

```typescript
// Create terminal
{
  command: 'createTerminal',
  config?: TerminalConfig
}

// Close terminal
{
  command: 'closeTerminal',
  terminalId: string
}

// Clear terminal
{
  command: 'clearTerminal',
  terminalId: string
}

// Send input
{
  command: 'sendInput',
  terminalId: string,
  data: string
}

// Resize terminal
{
  command: 'resizeTerminal',
  terminalId: string,
  cols: number,
  rows: number
}
```

## Context Keys

The extension sets the following context keys:

- `hiraTerminal.terminalFocus`: Whether a terminal is focused
- `hiraTerminal.terminalCount`: Number of active terminals
- `hiraTerminal.activeTerminalId`: ID of the active terminal
- `hiraTerminal.canSplitTerminal`: Whether terminal can be split
- `hiraTerminal.hasActiveTerminal`: Whether there's an active terminal

## Events

### Terminal Output Event
Fired when a terminal produces output.

```typescript
terminalManager.onTerminalOutput((event) => {
  console.log(`Terminal ${event.terminalId}: ${event.data}`);
});
```

### Terminal Closed Event
Fired when a terminal is closed.

```typescript
terminalManager.onTerminalClosed((terminalId) => {
  console.log(`Terminal closed: ${terminalId}`);
});
```