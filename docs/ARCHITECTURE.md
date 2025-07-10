# Hira Terminal Architecture

## Overview

Hira Terminal is a VS Code extension that provides a powerful terminal management system within the sidebar. It allows users to manage multiple terminal instances with split views and enhanced features.

## Core Components

### 1. Extension Entry Point (`src/extension.ts`)
- Initializes the extension
- Registers the sidebar webview provider
- Sets up command handlers
- Manages the extension lifecycle

### 2. Terminal Management (`src/terminals/`)

#### TerminalManager
- Central manager for all terminal instances
- Handles terminal creation, deletion, and state management
- Emits events for terminal output and closure
- Manages configuration from VS Code settings

#### TerminalInstance
- Represents a single terminal session
- Wraps the PTY (Pseudo Terminal) process
- Handles input/output operations
- Manages terminal state and lifecycle

#### PTYManager
- Creates and manages PTY processes using node-pty
- Handles shell detection and environment setup
- Manages PTY lifecycle and cleanup

### 3. UI Components (`src/webview/`)

#### SidebarTerminalProvider
- VS Code WebviewViewProvider implementation
- Manages the sidebar webview
- Handles communication between extension and webview
- Generates secure webview HTML

#### TerminalSplitView
- Manages the terminal UI layout
- Handles split view functionality
- Manages terminal panes and their arrangement
- Provides toolbar and empty state UI

### 4. Utilities (`src/utils/`)

#### CLIDetector
- Detects installed CLI tools
- Scans project for available scripts and tools
- Provides quick access to common commands

## Data Flow

1. **Terminal Creation**
   - User triggers "New Terminal" command
   - Extension creates TerminalInstance via TerminalManager
   - PTYManager spawns shell process
   - Webview creates UI elements
   - Terminal output streams to webview

2. **User Input**
   - User types in terminal (webview)
   - Input sent to extension via postMessage
   - Extension forwards to TerminalInstance
   - PTY process receives input

3. **Terminal Output**
   - PTY process generates output
   - PTYManager captures output
   - TerminalManager emits output event
   - SidebarTerminalProvider forwards to webview
   - Webview renders in xterm.js

## Communication Protocol

### Extension → Webview Messages
- `terminalCreated`: New terminal created
- `terminalOutput`: Terminal output data
- `terminalClosed`: Terminal closed

### Webview → Extension Messages
- `createTerminal`: Request new terminal
- `closeTerminal`: Close terminal
- `clearTerminal`: Clear terminal
- `sendInput`: Send user input
- `resizeTerminal`: Terminal resized

## Security Considerations

- Content Security Policy (CSP) enforced in webview
- Nonce-based script execution
- Sanitized terminal output
- Restricted file system access

## Performance Optimizations

- Lazy loading of terminal instances
- Efficient message passing
- Terminal output buffering
- Resource cleanup on disposal

## Focus Management System

### Context Keys (Based on VS Code Implementation)
- `terminalFocus`: Whether terminal is focused
- `terminalTextSelected`: Whether text is selected in terminal
- `terminalWebviewFocus`: Whether webview terminal is focused
- `terminalSidebarFocus`: Whether sidebar terminal container is focused

### Focus Tracking
- Uses VS Code's context key system for focus state
- Tracks focus across terminal instances
- Manages keyboard event routing based on focus state
- Handles focus transitions between terminals and main editor

### Keyboard Event Handling
- Custom key event handler using xterm.js `attachCustomKeyEventHandler()`
- Integrates with VS Code's keybinding system
- Supports context-aware key routing
- Allows VS Code commands to override terminal input when appropriate

## Interactive CLI Detection

### Claude Code Optimization
- Detects when Claude Code or similar interactive CLIs are running
- Optimizes keyboard event handling for better responsiveness
- Maintains proper focus during interactive sessions
- Handles special key sequences (Ctrl+C, Ctrl+D, arrow keys)

### CLI Detection Patterns
- Process name matching
- Command line argument analysis
- REPL mode detection
- Interactive session indicators

## Terminal Instance Lifecycle

### Creation
1. PTY process spawned with appropriate shell
2. Terminal UI created in webview
3. Event listeners established
4. Focus context keys initialized

### Active Management
- Input/output streaming
- Focus state tracking
- Resize handling
- Context key updates

### Cleanup
- PTY process termination
- Event listener cleanup
- Context key reset
- Resource disposal

## Extension Points

- Custom shell detection
- Theme integration
- Additional terminal addons
- Custom commands and keybindings
- Interactive CLI optimizations