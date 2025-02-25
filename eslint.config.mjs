const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    env: { es2022: true },
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

const eslintConfig = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
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

      // Import ordering
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
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
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
    'next/core-web-vitals',
    'next/typescript',
  ),
];

export default eslintConfig;
