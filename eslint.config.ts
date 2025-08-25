import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';

export default tseslint.config([
  {
    ignores: ['dist', 'husky-utils/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@app/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@assets/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@components/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@config/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@constants/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@features/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@hooks/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@services/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@stores/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@shared-types/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@utils/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          distinctGroup: true,
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': true,
        },
      ],

      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-useless-concat': 'error',

      // Custom rules to enforce enhanced SWR logging
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'swr',
              message: 'Use @lib/swr instead to enable comprehensive SWR logging for all operations.',
            },
            {
              name: 'swr/mutation',
              message: 'Use @lib/swr instead to enable comprehensive SWR logging for all operations.',
            },
            {
              name: 'swr/infinite',
              message: 'Use @lib/swr instead to enable comprehensive SWR logging for all operations.',
            },
          ],
        },
      ],
    },
  },
  // Allow the lib wrapper to import from 'swr'
  {
    files: ['src/lib/swr.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
