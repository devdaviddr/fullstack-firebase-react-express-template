module.exports = {
  root: true,
  env: { es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended'
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json']
      }
    }
  },
  rules: {
    'import/no-unresolved': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'import/default': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['packages/client/src/**/*.{ts,tsx}'],
      env: { browser: true, node: true, es2021: true },
      parserOptions: { project: ['./packages/client/tsconfig.json'] },
      rules: { 'import/no-named-as-default-member': 'off' }
    },
    {
      files: ['packages/server/src/**/*.{ts,tsx}'],
      env: { node: true, es2021: true },
      parserOptions: { project: ['./packages/server/tsconfig.json'] },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-named-as-default': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**', 'packages/**/tests/**'],
      env: { es2021: true },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'react/display-name': 'off'
      }
    },
    {
      files: ['**/*.config.ts', '**/*vite*.ts', '**/*vitest*.ts', '**/*tailwind*.ts'],
      parserOptions: { tsconfigRootDir: __dirname },
      rules: { '@typescript-eslint/no-explicit-any': 'off' }
    }
  ]
};
