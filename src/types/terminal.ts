export interface TerminalConfig {
  shell?: string;
  cwd?: string;
  env?: Record<string, string>;
  fontSize?: number;
  fontFamily?: string;
  theme?: TerminalTheme;
}

export interface TerminalTheme {
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

export interface TerminalSplitConfig {
  orientation: 'horizontal' | 'vertical';
  size?: number; // Percentage
}

export interface TerminalTab {
  id: string;
  title: string;
  isActive: boolean;
  terminals: TerminalPane[];
}

export interface TerminalPane {
  id: string;
  terminalId: string;
  size: number; // Percentage of parent
  children?: TerminalPane[];
  orientation?: 'horizontal' | 'vertical';
}