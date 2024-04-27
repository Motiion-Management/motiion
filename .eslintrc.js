module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'prettier'],
  settings: {
    next: {
      rootDir: 'apps/next/'
    }
  },
  root: true
}
