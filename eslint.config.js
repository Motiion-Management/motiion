import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        __DEV__: false,
        Atomics: false,
        ErrorUtils: false,
        FormData: false,
        SharedArrayBuffer: false,
        XMLHttpRequest: false,
        alert: false,
        cancelAnimationFrame: false,
        cancelIdleCallback: false,
        clearImmediate: false,
        clearInterval: false,
        clearTimeout: false,
        fetch: false,
        navigator: false,
        process: false,
        requestAnimationFrame: false,
        requestIdleCallback: false,
        setImmediate: false,
        setInterval: false,
        setTimeout: false,
        window: false,
        console: false,
        require: false,
        module: false,
        React: false,
        global: false,
        URL: false
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off', // Disable the base rule
      '@typescript-eslint/no-unused-vars': 'warn' // Enable the TS-aware rule
    },
    settings: {
      'import/extensions': [
        '.expo.android.js',
        '.expo.android.jsx',
        '.expo.android.ts',
        '.expo.android.tsx',
        '.expo.ios.js',
        '.expo.ios.jsx',
        '.expo.ios.ts',
        '.expo.ios.tsx',
        '.expo.web.js',
        '.expo.web.jsx',
        '.expo.web.ts',
        '.expo.web.tsx',
        '.expo.native.js',
        '.expo.native.jsx',
        '.expo.native.ts',
        '.expo.native.tsx',
        '.expo.js',
        '.expo.jsx',
        '.expo.ts',
        '.expo.tsx',
        '.android.js',
        '.android.jsx',
        '.android.ts',
        '.android.tsx',
        '.ios.js',
        '.ios.jsx',
        '.ios.ts',
        '.ios.tsx',
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.native.js',
        '.native.jsx',
        '.native.ts',
        '.native.tsx',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.d.ts'
      ]
    }
  }
]
