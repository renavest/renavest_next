import eslint from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';


export default [
  // Global ignores
  {
    ignores: ['src/scripts/**/*', 'dist/**/*', 'build/**/*', '.next/**/*']
  },
  
  // Base configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // React Hooks configuration
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  
  // Import plugin configuration for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/order': 'off', // Temporarily disabled for build
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/**/api',
              from: './src/features/**/ui',
              message: 'API layer should not import from UI layer',
            },
            {
              target: './src/features/**/domain',
              from: './src/features/**/ui',
              message: 'Domain layer should not import from UI layer',
            },
            {
              target: './src/features/**/domain',
              from: './src/features/**/api',
              message: 'Domain layer should not import from API layer',
            },
          ],
        },
      ],
    },
  },

  // Import plugin configuration for JavaScript files (without TypeScript parsing)
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
        },
      },
    },
    rules: {
      'import/order': 'off', // Temporarily disabled for build
    },
  },

  // Next.js configuration
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // Main configuration for all JavaScript/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/scripts/**/*.js'], // Ignore script files
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // File structure rules (relaxed for build)
      'max-lines': ['warn', { max: 800, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],

      // Code style (relaxed for build)
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // Exception for database schema file
  {
    files: ['**/db/schema.ts', '**/api/webhooks/clerk/handlers.ts'],
    rules: {
      'max-lines': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
    },
  },

  // TypeScript-specific rules only for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          modifiers: ['exported'],
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Apply Prettier as config
  prettier,
];
