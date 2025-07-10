import * as fs from 'fs';
import * as path from 'path';

export interface CLIInfo {
  name: string;
  command: string;
  icon?: string;
  description?: string;
  isInteractive?: boolean;
}

export interface InteractiveCLIDetection {
  isInteractive: boolean;
  cliName?: string;
  processName?: string;
  requiresSpecialHandling?: boolean;
}

export class CLIDetector {
  private static readonly CLI_CONFIGS: CLIInfo[] = [
    {
      name: 'Node.js',
      command: 'node',
      icon: 'node',
      description: 'JavaScript runtime',
      isInteractive: true
    },
    {
      name: 'Python',
      command: 'python',
      icon: 'python',
      description: 'Python interpreter',
      isInteractive: true
    },
    {
      name: 'Git',
      command: 'git',
      icon: 'git',
      description: 'Version control system'
    },
    {
      name: 'Docker',
      command: 'docker',
      icon: 'docker',
      description: 'Container platform'
    },
    {
      name: 'npm',
      command: 'npm',
      icon: 'npm',
      description: 'Node package manager'
    },
    {
      name: 'yarn',
      command: 'yarn',
      icon: 'yarn',
      description: 'Package manager'
    },
    {
      name: 'VS Code',
      command: 'code',
      icon: 'vscode',
      description: 'Visual Studio Code CLI'
    },
    {
      name: 'Claude Code',
      command: 'claude',
      icon: 'claude',
      description: 'Claude AI assistant',
      isInteractive: true
    }
  ];

  private static readonly INTERACTIVE_CLI_PATTERNS = [
    /claude/i,
    /python/i,
    /node/i,
    /repl/i,
    /interactive/i,
    /shell/i,
    /bash/i,
    /zsh/i,
    /fish/i
  ];

  public static async detectInstalledCLIs(): Promise<CLIInfo[]> {
    const detectedCLIs: CLIInfo[] = [];
    
    for (const cli of this.CLI_CONFIGS) {
      if (await this.isCommandAvailable(cli.command)) {
        detectedCLIs.push(cli);
      }
    }
    
    return detectedCLIs;
  }

  public static async detectProjectCLIs(workspacePath: string): Promise<CLIInfo[]> {
    const projectCLIs: CLIInfo[] = [];
    
    // Check for package.json scripts
    const packageJsonPath = path.join(workspacePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.scripts) {
          Object.keys(packageJson.scripts).forEach(scriptName => {
            projectCLIs.push({
              name: `npm run ${scriptName}`,
              command: `npm run ${scriptName}`,
              icon: 'npm',
              description: packageJson.scripts[scriptName]
            });
          });
        }
      } catch (error) {
        console.error('Error reading package.json:', error);
      }
    }
    
    // Check for Makefile
    const makefilePath = path.join(workspacePath, 'Makefile');
    if (fs.existsSync(makefilePath)) {
      projectCLIs.push({
        name: 'Make',
        command: 'make',
        icon: 'make',
        description: 'Build automation'
      });
    }
    
    // Check for docker-compose.yml
    const dockerComposePath = path.join(workspacePath, 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      projectCLIs.push({
        name: 'Docker Compose',
        command: 'docker-compose',
        icon: 'docker',
        description: 'Docker Compose'
      });
    }
    
    return projectCLIs;
  }

  /**
   * Detects if a command line or process is an interactive CLI
   * @param commandLine The command line being executed
   * @param processName The process name
   * @returns Detection result with CLI information
   */
  public static detectInteractiveCLI(
    commandLine: string,
    processName?: string
  ): InteractiveCLIDetection {
    const lowerCommandLine = commandLine.toLowerCase();
    const lowerProcessName = processName?.toLowerCase() || '';

    // Check for Claude Code specifically
    if (lowerCommandLine.includes('claude') || lowerProcessName.includes('claude')) {
      return {
        isInteractive: true,
        cliName: 'Claude Code',
        processName: processName,
        requiresSpecialHandling: true
      };
    }

    // Check for other interactive CLIs
    for (const pattern of this.INTERACTIVE_CLI_PATTERNS) {
      if (pattern.test(lowerCommandLine) || pattern.test(lowerProcessName)) {
        return {
          isInteractive: true,
          cliName: this.getCliNameFromPattern(pattern),
          processName: processName,
          requiresSpecialHandling: pattern.test('claude')
        };
      }
    }

    // Check for REPL indicators
    if (this.isREPLMode(commandLine)) {
      return {
        isInteractive: true,
        cliName: 'REPL',
        processName: processName,
        requiresSpecialHandling: false
      };
    }

    return {
      isInteractive: false
    };
  }

  /**
   * Determines if the current session is in REPL mode
   * @param commandLine The command line being executed
   * @returns True if in REPL mode
   */
  public static isREPLMode(commandLine: string): boolean {
    const replIndicators = [
      '>>>',  // Python REPL
      '>',    // Node.js REPL
      '$',    // Shell prompt
      '#',    // Root shell prompt
      'repl', // Explicit REPL
      'interactive'
    ];

    return replIndicators.some(indicator => 
      commandLine.includes(indicator)
    );
  }

  /**
   * Checks if special key handling is required for interactive CLIs
   * @param cliName The name of the CLI
   * @returns True if special handling is needed
   */
  public static requiresSpecialKeyHandling(cliName: string): boolean {
    const specialCliNames = ['Claude Code', 'claude', 'python', 'node'];
    return specialCliNames.some(name => 
      cliName.toLowerCase().includes(name.toLowerCase())
    );
  }

  private static getCliNameFromPattern(pattern: RegExp): string {
    const patternString = pattern.toString();
    if (patternString.includes('claude')) return 'Claude Code';
    if (patternString.includes('python')) return 'Python';
    if (patternString.includes('node')) return 'Node.js';
    if (patternString.includes('repl')) return 'REPL';
    return 'Interactive CLI';
  }

  private static async isCommandAvailable(command: string): Promise<boolean> {
    const { spawn } = await import('child_process');
    
    return new Promise<boolean>((resolve) => {
      const isWindows = process.platform === 'win32';
      const checkCommand = isWindows ? 'where' : 'which';
      
      const child = spawn(checkCommand, [command], {
        stdio: 'ignore',
        windowsHide: true
      });
      
      child.on('error', () => resolve(false));
      child.on('exit', (code) => resolve(code === 0));
    });
  }
}