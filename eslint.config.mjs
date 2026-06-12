import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      semi: ['error', 'never'],
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration',
          message: 'Use functional patterns instead of classes.',
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
