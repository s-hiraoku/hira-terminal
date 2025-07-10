import { CLIDetector } from '../../src/utils/cliDetector';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

describe('CLIDetector', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectProjectCLIs', () => {
    it('should detect npm scripts from package.json', async () => {
      const workspacePath = '/test/project';
      const packageJson = {
        scripts: {
          test: 'jest',
          build: 'webpack',
          start: 'node index.js'
        }
      };
      
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.join(workspacePath, 'package.json');
      });
      
      mockFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));
      
      const clis = await CLIDetector.detectProjectCLIs(workspacePath);
      
      expect(clis).toHaveLength(3);
      expect(clis).toContainEqual({
        name: 'npm run test',
        command: 'npm run test',
        icon: 'npm',
        description: 'jest'
      });
      expect(clis).toContainEqual({
        name: 'npm run build',
        command: 'npm run build',
        icon: 'npm',
        description: 'webpack'
      });
    });

    it('should detect Makefile', async () => {
      const workspacePath = '/test/project';
      
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.join(workspacePath, 'Makefile');
      });
      
      const clis = await CLIDetector.detectProjectCLIs(workspacePath);
      
      expect(clis).toContainEqual({
        name: 'Make',
        command: 'make',
        icon: 'make',
        description: 'Build automation'
      });
    });

    it('should detect docker-compose.yml', async () => {
      const workspacePath = '/test/project';
      
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.join(workspacePath, 'docker-compose.yml');
      });
      
      const clis = await CLIDetector.detectProjectCLIs(workspacePath);
      
      expect(clis).toContainEqual({
        name: 'Docker Compose',
        command: 'docker-compose',
        icon: 'docker',
        description: 'Docker Compose'
      });
    });

    it('should handle missing files gracefully', async () => {
      const workspacePath = '/test/project';
      
      mockFs.existsSync.mockReturnValue(false);
      
      const clis = await CLIDetector.detectProjectCLIs(workspacePath);
      
      expect(clis).toHaveLength(0);
    });

    it('should handle invalid package.json gracefully', async () => {
      const workspacePath = '/test/project';
      
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.join(workspacePath, 'package.json');
      });
      
      mockFs.readFileSync.mockReturnValue('invalid json');
      
      const clis = await CLIDetector.detectProjectCLIs(workspacePath);
      
      expect(clis).toHaveLength(0);
    });
  });
});