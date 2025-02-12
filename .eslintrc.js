module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    env: {
      browser: true,
      amd: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'prettier',
    ],
    rules: {
      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Interfaces use PascalCase
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        // Type names must be in PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Variables and functions must be in camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        // React components must be in PascalCase
        {
          selector: 'function',
          modifiers: ['exported'],
          format: ['PascalCase'],
        },
      ],
      
      // Import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      
      // File structure rules
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      
      // Code style
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      
      // Vertical slice specific rules
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
  }