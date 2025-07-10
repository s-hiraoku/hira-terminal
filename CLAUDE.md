# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development
npm run watch          # Watch and compile TypeScript automatically
npm run compile        # One-time TypeScript compilation with webpack

# Testing
npm test              # Run Jest test suite
npm run watch-tests   # Run tests in watch mode

# Linting and Quality
npm run lint          # Run ESLint on TypeScript files

# Production Build
npm run package       # Build production version with minification
```

## Architecture Overview

This is a VS Code extension that provides terminal management in the sidebar. It uses a dual-architecture approach with the extension host communicating with a webview.

### Core Flow
1. **Extension Host** (Node.js environment): Manages terminal processes using node-pty
2. **Webview** (Browser environment): Renders terminal UI using xterm.js
3. Communication via VS Code's `postMessage` API

### Key Components

**Terminal Lifecycle Management**
- `TerminalManager` coordinates all terminal instances (max 5 terminals)
- `PTYManager` spawns shell processes using node-pty with MockPTY fallback
- Each terminal has unique ID: `terminal-{timestamp}-{random}`

**UI Architecture**
- `SidebarTerminalProvider` implements VS Code's WebviewViewProvider
- Terminal UI rendered in sidebar using xterm.js
- Split view functionality planned but not yet implemented

**Focus and Context Management**
- Uses VS Code context keys: `hiraTerminal.terminalFocus`, `hiraTerminal.activeTerminalId`
- Special handling for interactive CLIs (Claude Code, Python REPL, Node REPL)
- Focus events flow: Webview → Extension → Context Keys

**Message Protocol (Extension ↔ Webview)**
- From Extension: `terminalCreated`, `terminalOutput`, `terminalClosed`
- From Webview: `createTerminal`, `sendInput`, `resizeTerminal`, `closeTerminal`

### Special Implementation Details

**node-pty Fallback Strategy**
The extension attempts to use native node-pty but falls back to MockPTY (using child_process) if native module fails to load. This is critical for compatibility across different Node.js versions.

**Interactive CLI Detection**
`CLIDetector` identifies when Claude Code or other interactive CLIs are running to optimize keyboard handling. Detection patterns in `INTERACTIVE_CLI_PATTERNS`.

**Webpack Configuration**
Two separate builds:
- Extension code: Node.js target, externals include 'vscode' and 'node-pty'
- Webview code: Web target, separate tsconfig at `tsconfig.webview.json`

## Testing Approach

Tests mock both VS Code API and node-pty. Key test files:
- `test/terminals/TerminalManager.test.ts` - Core terminal lifecycle
- `test/utils/cliDetector.test.ts` - CLI detection logic

Run specific test: `npm test -- --testNamePattern="pattern"`

## Configuration

User settings under `hira-terminal.*`:
- `defaultShell`: Override default shell
- `fontSize`: Terminal font size (default: 14)
- `fontFamily`: Terminal font family

## Known Issues and Limitations

1. node-pty native module must be rebuilt for the specific Node.js version
2. Terminal split functionality is designed but not implemented
3. Windows platform support is limited (MockPTY fallback likely)
4. Maximum 5 terminals enforced to prevent resource exhaustion