# Hira Terminal

A VS Code extension that provides a powerful terminal management system within the sidebar, allowing you to manage multiple terminal instances with split views and enhanced features.

## Features

- **Sidebar Terminal Management**: Access and manage all your terminals from the VS Code sidebar
- **Split Terminal Views**: Create horizontal and vertical splits within the sidebar
- **Multiple Terminal Sessions**: Run multiple independent terminal sessions
- **CLI Detection**: Automatically detects and integrates with various CLI tools
- **Customizable**: Configure shell, font size, and font family

## Requirements

- VS Code version 1.74.0 or higher
- Node.js 16.x or higher

## Extension Settings

This extension contributes the following settings:

* `hira-terminal.defaultShell`: Default shell to use for new terminals
* `hira-terminal.fontSize`: Terminal font size (default: 14)
* `hira-terminal.fontFamily`: Terminal font family

## Development

### Setup

```bash
# Install dependencies
npm install

# Compile and watch for changes
npm run watch
```

### Building

```bash
# Build for production
npm run package
```

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Project Structure

```
hira-terminal/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── providers/           # VS Code providers
│   ├── terminals/           # Terminal management
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── webview/            # Webview UI components
├── docs/                   # Documentation
├── test/                   # Test files
└── .vscode/               # VS Code settings
```

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release of Hira Terminal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the MIT License.