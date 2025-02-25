Here's an updated version of your ESLint + Prettier setup markdown file to reflect your current setup accurately:

---

# **ESLint + Prettier Setup**

Quick setup guide for ESLint and Prettier in **VS Code**.

---

## 🔌 **Required Extensions**

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier - Code formatter** (`esbenp.prettier-vscode`)

---

## ⚙️ **VS Code Settings**

Add the following to your `settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always"
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

---

### 🔍 **Explanation of Settings**

- ✅ **Auto-fix ESLint errors on save**: Automatically runs ESLint fixes when you save a file.
- 📝 **Use Prettier as the default formatter**: Ensures consistent formatting across your codebase.
- 💾 **Format code on save**: Runs Prettier to format files automatically.
- 📜 **Enable ESLint for JS/TS files**: Validates JavaScript, TypeScript, React (JSX/TSX) files.
- 🔄 **Use Flat Config**: Uses ESLint’s modern configuration system (`eslint.config.mjs`).
