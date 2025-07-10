export enum ContextKeys {
  TerminalFocus = 'hiraTerminal.terminalFocus',
  TerminalCount = 'hiraTerminal.terminalCount',
  ActiveTerminalId = 'hiraTerminal.activeTerminalId',
  CanSplitTerminal = 'hiraTerminal.canSplitTerminal',
  HasActiveTerminal = 'hiraTerminal.hasActiveTerminal',
  TerminalWebviewFocus = 'hiraTerminal.terminalWebviewFocus',
  TerminalSidebarFocus = 'hiraTerminal.terminalSidebarFocus',
  TerminalTextSelected = 'hiraTerminal.terminalTextSelected',
  IsInteractiveCLI = 'hiraTerminal.isInteractiveCLI'
}

export interface ContextKeyService {
  setContext(key: ContextKeys, value: any): void;
  getContext(key: ContextKeys): any;
}

export interface FocusTracker {
  readonly isFocused: boolean;
  focus(): void;
  blur(): void;
  onDidChangeFocus: (listener: (focused: boolean) => void) => void;
}