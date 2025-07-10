# 🚀 Hira Terminal

VS Code準拠の縦分割可能なターミナル拡張機能で、サイドバーに表示される高機能なターミナル管理システムです。

## ✨ 主要機能

### 🔥 Core Features
- **🖥️ マルチターミナル管理**: 最大5個のターミナル同時実行
- **📱 サイドバー統合**: Primary Sidebarでの直感的な操作
- **🎯 フォーカス管理**: VS Code準拠のコンテキストキーシステム
- **⚡ 高性能PTY**: node-ptyとMock PTYのハイブリッド実装

### 🤖 AI対応機能
- **Claude Code特別対応**: 対話型セッションの完全最適化
- **📊 インタラクティブCLI検出**: Python、Node.js REPL等の自動認識
- **⌨️ スマートキーハンドリング**: 対話型CLI向け特殊キー処理

### 🛠️ 開発者向け機能
- **🔧 プロジェクトCLI検出**: package.jsonスクリプト自動認識
- **🎨 テーマ統合**: VS Codeテーマとの完全連携
- **📝 ログ出力**: デバッグ用詳細ログ

## 🚀 クイックスタート

### インストール
```bash
git clone https://github.com/your-repo/hira-terminal
cd hira-terminal
npm install
```

### 開発モード起動
```bash
# 1. ウォッチモードでコンパイル
npm run watch

# 2. VS Codeでプロジェクトを開き、F5キーでExtension Host起動
# 3. 新しいVS Codeウィンドウが開いたら、サイドバーのHira Terminalアイコンをクリック
```

## 📖 使用方法

### 基本操作
1. **ターミナル作成**: サイドバーの「New Terminal」ボタン
2. **ターミナル操作**: Clear、Close、Splitボタン
3. **フォーカス切り替え**: ターミナル間のクリック移動

### Claude Code最適化
```bash
# Claude Codeを起動すると自動で検出・最適化
claude

# 特殊キーの適切な処理:
# - Ctrl+C: セッション中断
# - Ctrl+D: セッション終了  
# - ↑↓: 履歴ナビゲーション
```

### 設定カスタマイズ
```json
{
  "hira-terminal.shell": "/bin/zsh",
  "hira-terminal.fontSize": 16,
  "hira-terminal.fontFamily": "Fira Code",
  "hira-terminal.enabled": true
}
```

## 🏗️ アーキテクチャ

### Core Components
```
┌─────────────────────────────────────────────┐
│                Extension Host                │
├─────────────────────────────────────────────┤
│  TerminalManager → TerminalInstance         │
│  FocusManager    → PTYManager               │
│  CLIDetector     → SidebarProvider          │
└─────────────────────────────────────────────┘
                        ↕️
┌─────────────────────────────────────────────┐
│              Webview (Sidebar)               │
├─────────────────────────────────────────────┤
│  xterm.js → TerminalSplitView               │
│  Message Protocol → Event Handling          │
└─────────────────────────────────────────────┘
```

### 技術スタック
- **Backend**: TypeScript + VS Code Extension API
- **Frontend**: xterm.js + Custom Webview
- **PTY**: node-pty + Mock PTY Fallback
- **Build**: Webpack + TypeScript Compiler

## 🧪 対応CLI

### 🤖 AI Tools
- **Claude Code** ⭐ (最適化済み)
- OpenAI CLI
- GitHub Copilot CLI

### 🛠️ Development Tools
- **Node.js REPL** (対話型最適化)
- **Python REPL** (対話型最適化)
- Git, Docker, npm, yarn
- Make, Docker Compose

### 📦 Project Detection
- `package.json` scripts
- `Makefile` targets
- `docker-compose.yml` services

## 🔧 開発ガイド

### 必要環境
- Node.js 18+
- VS Code 1.80+
- macOS/Linux (Windows対応準備中)

### ビルド手順
```bash
# 依存関係インストール
npm install

# TypeScriptコンパイル
npm run compile

# Webpackビルド
npm run build

# デバッグ実行
npm run watch
```

### テスト実行
```bash
# 単体テスト
npm test

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e
```

## 📚 API Reference

### TerminalManager
```typescript
class TerminalManager {
  createTerminal(config?: TerminalConfig): Promise<string>
  closeTerminal(terminalId: string): boolean
  sendInput(terminalId: string, data: string): boolean
  resizeTerminal(terminalId: string, cols: number, rows: number): boolean
}
```

### FocusManager
```typescript
class FocusManager {
  focus(terminalId?: string): void
  blur(): void
  setActiveTerminal(terminalId: string): void
  setInteractiveCLI(isInteractive: boolean): void
}
```

## 🤝 コントリビューション

1. **Fork** このリポジトリ
2. **ブランチ作成** `git checkout -b feature/amazing-feature`
3. **変更をコミット** `git commit -m 'Add amazing feature'`
4. **プッシュ** `git push origin feature/amazing-feature`
5. **Pull Request作成**

### 🧹 コードスタイル
- TypeScript strictモード
- ESLint + Prettier
- 2スペースインデント
- JSDocコメント必須

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🙏 謝辞

- [VS Code](https://code.visualstudio.com/) - 素晴らしい拡張機能プラットフォーム
- [xterm.js](https://xtermjs.org/) - ブラウザ向けターミナルエミュレーター
- [node-pty](https://github.com/microsoft/node-pty) - Node.js PTY実装
- [Claude AI](https://claude.ai/) - 開発支援

---

**🎯 Claude Code完全対応のプロフェッショナルターミナル拡張機能**