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
    this.createEmptyState();
  }


  private createEmptyState(): void {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.id = 'empty-state';
    
    emptyState.innerHTML = `
      <div class="empty-state-icon codicon codicon-terminal"></div>
      <div class="empty-state-text">No terminals open</div>
      <div class="empty-state-hint">Use the toolbar to create a new terminal</div>
    `;
    
    this.container.appendChild(emptyState);
  }

  public addTerminal(terminalId: string): HTMLElement {
    // Hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Create terminal pane (just the content area)
    const pane = document.createElement('div');
    pane.className = 'terminal-pane';
    pane.id = `terminal-${terminalId}`;
    
    // Add to container
    let terminalContainer = document.querySelector('.terminal-split-container');
    if (!terminalContainer) {
      terminalContainer = document.createElement('div');
      terminalContainer.className = 'terminal-split-container vertical';
      this.container.appendChild(terminalContainer);
    }
    
    terminalContainer.appendChild(pane);
    
    // Store reference
    this.terminals.set(terminalId, pane);
    this.setActiveTerminal(terminalId);
    
    return pane;
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

}