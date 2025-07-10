# Development Guide

## Prerequisites

- Node.js 16.x or higher
- VS Code 1.74.0 or higher
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hira-terminal
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run compile
```

## Development Workflow

### Running in Development Mode

1. Open the project in VS Code
2. Press `F5` to launch a new VS Code window with the extension loaded
3. The extension will be available in the sidebar

### Watch Mode

For continuous compilation during development:
```bash
npm run watch
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run watch-tests
```

### Linting

Check code style:
```bash
npm run lint
```

## Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── providers/           # VS Code providers
│   └── SidebarTerminalProvider.ts
├── terminals/           # Terminal management
│   ├── TerminalManager.ts
│   ├── TerminalInstance.ts
│   └── PTYManager.ts
├── types/              # TypeScript type definitions
│   ├── terminal.ts
│   └── contextKeys.ts
├── utils/              # Utility functions
│   └── cliDetector.ts
└── webview/            # Webview UI
    ├── main.ts
    ├── style.css
    └── components/
        └── TerminalSplitView.ts
```

## Key Concepts

### Terminal Management

The extension uses `node-pty` to spawn real shell processes. Each terminal instance is managed by the `TerminalManager` and has its own PTY process.

### Webview Communication

Communication between the extension and webview uses VS Code's message passing API:

```typescript
// Extension to Webview
webview.postMessage({ command: 'terminalOutput', data: '...' });

// Webview to Extension
vscode.postMessage({ command: 'sendInput', data: '...' });
```

### State Management

Terminal state is managed in the extension context and synchronized with the webview. The extension is the source of truth for all terminal state.

## Debugging

### Extension Debugging

1. Set breakpoints in the TypeScript files
2. Press `F5` to start debugging
3. Use VS Code's debug console

### Webview Debugging

1. Open the webview
2. Run command: `Developer: Open Webview Developer Tools`
3. Use Chrome DevTools for debugging

### Common Issues

1. **PTY not found**: Ensure `node-pty` is properly built for your platform
2. **Webview not loading**: Check CSP settings and script paths
3. **Terminal not responding**: Check PTY process status and error logs

## Building for Production

```bash
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for public APIs

### Testing Guidelines

- Write unit tests for new features
- Test edge cases
- Mock external dependencies
- Aim for high code coverage

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Build and test the extension
4. Create a GitHub release
5. Publish to VS Code Marketplace