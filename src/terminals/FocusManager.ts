import * as vscode from 'vscode';
import { ContextKeys, FocusTracker } from '../types/contextKeys';

export class FocusManager implements FocusTracker {
  private _isFocused = false;
  private _focusEmitter = new vscode.EventEmitter<boolean>();
  private _activeTerminalId?: string;
  private _contextKeyService: vscode.Context;

  public readonly onDidChangeFocus = this._focusEmitter.event;

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {
    this._contextKeyService = context as any;
    this._initializeContextKeys();
  }

  public get isFocused(): boolean {
    return this._isFocused;
  }

  public get activeTerminalId(): string | undefined {
    return this._activeTerminalId;
  }

  public focus(terminalId?: string): void {
    const wasFocused = this._isFocused;
    this._isFocused = true;
    
    if (terminalId) {
      this._activeTerminalId = terminalId;
      this._updateContextKey(ContextKeys.ActiveTerminalId, terminalId);
    }

    this._updateContextKey(ContextKeys.TerminalFocus, true);
    this._updateContextKey(ContextKeys.TerminalWebviewFocus, true);
    
    if (!wasFocused) {
      this._focusEmitter.fire(true);
    }
  }

  public blur(): void {
    const wasFocused = this._isFocused;
    this._isFocused = false;
    
    this._updateContextKey(ContextKeys.TerminalFocus, false);
    this._updateContextKey(ContextKeys.TerminalWebviewFocus, false);
    
    if (wasFocused) {
      this._focusEmitter.fire(false);
    }
  }

  public setActiveTerminal(terminalId: string): void {
    this._activeTerminalId = terminalId;
    this._updateContextKey(ContextKeys.ActiveTerminalId, terminalId);
  }

  public setTerminalCount(count: number): void {
    this._updateContextKey(ContextKeys.TerminalCount, count);
    this._updateContextKey(ContextKeys.HasActiveTerminal, count > 0);
    this._updateContextKey(ContextKeys.CanSplitTerminal, count > 0 && count < 5);
  }

  public setTextSelected(selected: boolean): void {
    this._updateContextKey(ContextKeys.TerminalTextSelected, selected);
  }

  public setInteractiveCLI(isInteractive: boolean): void {
    this._updateContextKey(ContextKeys.IsInteractiveCLI, isInteractive);
  }

  public setSidebarFocus(focused: boolean): void {
    this._updateContextKey(ContextKeys.TerminalSidebarFocus, focused);
  }

  public onDidChangeFocus(listener: (focused: boolean) => void): vscode.Disposable {
    return this._focusEmitter.event(listener);
  }

  public dispose(): void {
    this._focusEmitter.dispose();
    this._resetContextKeys();
  }

  private _initializeContextKeys(): void {
    this._updateContextKey(ContextKeys.TerminalFocus, false);
    this._updateContextKey(ContextKeys.TerminalCount, 0);
    this._updateContextKey(ContextKeys.ActiveTerminalId, undefined);
    this._updateContextKey(ContextKeys.CanSplitTerminal, false);
    this._updateContextKey(ContextKeys.HasActiveTerminal, false);
    this._updateContextKey(ContextKeys.TerminalWebviewFocus, false);
    this._updateContextKey(ContextKeys.TerminalSidebarFocus, false);
    this._updateContextKey(ContextKeys.TerminalTextSelected, false);
    this._updateContextKey(ContextKeys.IsInteractiveCLI, false);
  }

  private _updateContextKey(key: ContextKeys, value: any): void {
    vscode.commands.executeCommand('setContext', key, value);
  }

  private _resetContextKeys(): void {
    this._updateContextKey(ContextKeys.TerminalFocus, false);
    this._updateContextKey(ContextKeys.TerminalCount, 0);
    this._updateContextKey(ContextKeys.ActiveTerminalId, undefined);
    this._updateContextKey(ContextKeys.CanSplitTerminal, false);
    this._updateContextKey(ContextKeys.HasActiveTerminal, false);
    this._updateContextKey(ContextKeys.TerminalWebviewFocus, false);
    this._updateContextKey(ContextKeys.TerminalSidebarFocus, false);
    this._updateContextKey(ContextKeys.TerminalTextSelected, false);
    this._updateContextKey(ContextKeys.IsInteractiveCLI, false);
  }
}