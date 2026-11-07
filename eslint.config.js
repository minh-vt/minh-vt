import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'

/**
 * Two kinds of rule here.
 *
 * Errors encode decisions that are already made: no relative imports, no colour
 * literals. They fail the build, which is the only way a convention survives.
 *
 * Warnings flag code that is getting hard to read: deep nesting, long files,
 * wide parameter lists. They show up in review without stopping a deploy.
 */

const IMPORT_MESSAGE = 'Use the @/ alias instead of a relative path.'

const COLOUR_LITERAL = {
  selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
  message:
    'Hardcoded colour. Use a token from src/theme/tokens.css via a UnoCSS utility or a var().',
}

const COLOUR_IN_TEMPLATE = {
  selector: 'TemplateElement[value.raw=/#(?:[0-9a-fA-F]{6})/]',
  message:
    'Hardcoded colour. Use a token from src/theme/tokens.css via a UnoCSS utility or a var().',
}

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'public/', 'bun.lock'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...svelte.configs['flat/recommended'],

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Errors: structural conventions.
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ group: ['./*', '../*'], message: IMPORT_MESSAGE }],
        },
      ],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      'no-restricted-syntax': ['error', COLOUR_LITERAL, COLOUR_IN_TEMPLATE],

      // Warnings: readability.
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      complexity: ['warn', 15],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    // Svelte components carry TypeScript inside <script lang="ts">, so the
    // template parser has to hand that block to the TS parser.
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },

  {
    // Templates are declarative; line count there says little about comprehension.
    files: ['**/*.svelte', '**/*.ts'],
    rules: {
      'max-lines': ['warn', { max: 220, skipBlankLines: true, skipComments: true }],
    },
  },

  {
    // The one place a literal colour is unavoidable: the browser reads these
    // before any CSS exists.
    files: ['src/theme/browser-chrome.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  prettier,
]
