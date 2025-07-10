// Mock VS Code API for testing
const vscode = {
  EventEmitter: class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    
    event = (listener) => {
      this.listeners.push(listener);
      return {
        dispose: () => {
          const index = this.listeners.indexOf(listener);
          if (index > -1) {
            this.listeners.splice(index, 1);
          }
        }
      };
    };
    
    fire(data) {
      this.listeners.forEach(listener => listener(data));
    }
    
    dispose() {
      this.listeners = [];
    }
  },
  
  workspace: {
    getConfiguration: (section) => ({
      get: (key) => {
        const configs = {
          'hira-terminal': {
            defaultShell: '',
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace'
          }
        };
        return configs[section]?.[key];
      }
    }),
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' }
    }]
  },
  
  window: {
    registerWebviewViewProvider: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn()
  },
  
  commands: {
    registerCommand: jest.fn()
  },
  
  Uri: {
    joinPath: (base, ...paths) => ({
      fsPath: [base.fsPath, ...paths].join('/'),
      toString: () => [base.fsPath, ...paths].join('/')
    }),
    file: (path) => ({ fsPath: path })
  },
  
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  
  ExtensionContext: class {
    constructor() {
      this.subscriptions = [];
      this.extensionUri = { fsPath: '/test/extension' };
    }
  }
};

module.exports = vscode;