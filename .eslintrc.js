module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {
    next: {
      rootDir: 'apps/next/'
    }
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  },
  root: true
}
