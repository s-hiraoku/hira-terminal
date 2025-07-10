export class TerminalSplitView {
  private container: HTMLElement;
  private terminals: Map<string, HTMLElement> = new Map();
  private activeTerminalId?: string;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  private initialize(): void {
    this.container.innerHTML = '';
    this.createToolbar();
    this.createEmptyState();
  }

  private createToolbar(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'terminal-toolbar';
    
    const newTerminalButton = this.createToolbarButton('New Terminal', '$(add)', () => {
      this.requestNewTerminal();
    });
    
    const splitHorizontalButton = this.createToolbarButton('Split Horizontal', '$(split-horizontal)', () => {
      this.splitTerminal('horizontal');
    });
    
    const splitVerticalButton = this.createToolbarButton('Split Vertical', '$(split-vertical)', () => {
      this.splitTerminal('vertical');
    });
    
    toolbar.appendChild(newTerminalButton);
    toolbar.appendChild(this.createSeparator());
    toolbar.appendChild(splitHorizontalButton);
    toolbar.appendChild(splitVerticalButton);
    
    this.container.appendChild(toolbar);
  }

  private createToolbarButton(title: string, icon: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.className = 'toolbar-button';
    button.title = title;
    button.innerHTML = `<span class="codicon ${icon}"></span><span>${title}</span>`;
    button.onclick = onClick;
    return button;
  }

  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.className = 'toolbar-separator';
    return separator;
  }

  private createEmptyState(): void {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.id = 'empty-state';
    
    emptyState.innerHTML = `
      <div class="empty-state-icon codicon codicon-terminal"></div>
      <div class="empty-state-text">No terminals open</div>
      <button class="empty-state-button" onclick="window.terminalView.requestNewTerminal()">
        Create New Terminal
      </button>
    `;
    
    this.container.appendChild(emptyState);
  }

  public addTerminal(terminalId: string): HTMLElement {
    // Hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Create terminal pane
    const pane = document.createElement('div');
    pane.className = 'terminal-pane';
    pane.id = `terminal-${terminalId}`;
    
    // Create header
    const header = document.createElement('div');
    header.className = 'terminal-pane-header';
    
    const title = document.createElement('div');
    title.className = 'terminal-pane-title';
    title.textContent = `Terminal ${this.terminals.size + 1}`;
    
    const actions = document.createElement('div');
    actions.className = 'terminal-pane-actions';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'terminal-pane-action';
    closeButton.innerHTML = '<span class="codicon codicon-close"></span>';
    closeButton.title = 'Close Terminal';
    closeButton.onclick = () => this.closeTerminal(terminalId);
    
    actions.appendChild(closeButton);
    header.appendChild(title);
    header.appendChild(actions);
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'terminal-pane-content';
    
    pane.appendChild(header);
    pane.appendChild(content);
    
    // Add to container
    let terminalContainer = document.querySelector('.terminal-split-container');
    if (!terminalContainer) {
      terminalContainer = document.createElement('div');
      terminalContainer.className = 'terminal-split-container vertical';
      this.container.appendChild(terminalContainer);
    }
    
    terminalContainer.appendChild(pane);
    
    // Store reference
    this.terminals.set(terminalId, content);
    this.setActiveTerminal(terminalId);
    
    return content;
  }

  public removeTerminal(terminalId: string): void {
    const pane = document.getElementById(`terminal-${terminalId}`);
    if (pane) {
      pane.remove();
    }
    
    this.terminals.delete(terminalId);
    
    // Show empty state if no terminals
    if (this.terminals.size === 0) {
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        emptyState.style.display = 'flex';
      }
    }
  }

  private setActiveTerminal(terminalId: string): void {
    // Remove active class from all panes
    document.querySelectorAll('.terminal-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    // Add active class to current pane
    const pane = document.getElementById(`terminal-${terminalId}`);
    if (pane) {
      pane.classList.add('active');
    }
    
    this.activeTerminalId = terminalId;
  }

  private requestNewTerminal(): void {
    (window as any).vscode.postMessage({ command: 'createTerminal' });
  }

  private splitTerminal(orientation: 'horizontal' | 'vertical'): void {
    if (this.activeTerminalId) {
      (window as any).vscode.postMessage({
        command: 'splitTerminal',
        terminalId: this.activeTerminalId,
        orientation
      });
    }
  }

  private closeTerminal(terminalId: string): void {
    (window as any).vscode.postMessage({
      command: 'closeTerminal',
      terminalId
    });
  }
}

// Make available globally for empty state button
(window as any).terminalView = {
  requestNewTerminal: () => {
    (window as any).vscode.postMessage({ command: 'createTerminal' });
  }
};