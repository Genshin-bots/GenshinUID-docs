import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/dist/',
      '**/node_modules',
      '**/node_modules/',
      '**/types/',
      '**/cache/',
      '!docs/.vitepress',
      '!.eslintrc.js',
      '!**/.test',
      '**/.temp',
    ],
  },
  ...compat.extends('@antfu'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      'vue/no-deprecated-functional-template': 'off',
      'vue/one-component-per-file': 'off',
      'vue/no-template-shadow': 'off',
      'vue/valid-v-for': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'vue/require-prop-types': 'off',
      '@typescript-eslint/no-use-before-define': 'off',

      'spaced-comment': [
        'error',
        'always',
        {
          exceptions: ['#__PURE__'],
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          paths: ['..', '../..'],
        },
      ],

      'node/no-callback-literal': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-mutable-exports': 'off',
      'import/no-named-as-default': 'off',
      'import/newline-after-import': 'off',
      'import/no-named-as-default-member': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: [
      '**/*.md',
      '**/*.md/*.*',
      '**/demo.vue',
      '**/demo.client.vue',
      'scripts/*.ts',
      '**/*.test.ts',
      '**/utils.ts',
    ],

    rules: {
      'no-alert': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-invalid-this': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'off',

      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowedNames: ['self', 'instance'],
        },
      ],
    },
  },
  {
    files: ['docs/.vitepress/**/*.*'],

    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['docs/.vitepress/theme/plugins/**/*.*'],

    rules: {
      'prefer-rest-params': 'off',
    },
  },
];
