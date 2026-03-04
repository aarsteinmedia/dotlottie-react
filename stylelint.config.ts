import type { Config } from 'stylelint'

import recommended from 'stylelint-config-recommended'

const config: Config = {
  ...recommended,
  ignoreFiles: [
    '**/dist',
    '**/vendor',
    '**/node_modules',
    '**/svn',
    '**/build',
  ],
  rules: {
    ...recommended.rules,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'no-descending-specificity': [
      true, { severity: 'warning' },
    ],
    'selector-class-pattern': null,
  }
}

export default config