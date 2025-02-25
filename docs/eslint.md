# ESLint + Prettier Setup

Quick setup guide for ESLint and Prettier in VS Code.

## Required Extensions

1. ESLint (`dbaeumer.vscode-eslint`)
2. Prettier (`esbenp.prettier-vscode`)

## VS Code Settings

Add to your `settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.workingDirectories": [
    {
      "mode": "auto"
    }
  ],
  "eslint.useFlatConfig": true
}
```

These settings will:

- Auto-fix ESLint errors on save
- Use Prettier as default formatter
- Format code on save
- Enable ESLint for JS/TS files
- Use the new flat config system
