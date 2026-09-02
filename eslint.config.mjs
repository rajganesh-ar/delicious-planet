import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// eslint-config-next 16 ships native flat configs, so they are spread in
// directly. Going through FlatCompat instead makes the eslintrc shim try to
// validate an already-flat config, which fails inside the error formatter with
// an unrelated "Converting circular structure to JSON".
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Maintenance scripts under scripts/ are CommonJS by extension, so require()
    // is the correct import form there, not a lint failure.
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // md/unused holds retired components kept for reference; they are not built
    // and are excluded from tsconfig too.
    ignores: ['.next/', 'md/unused/', 'md/unused-assets/'],
  },
]

export default eslintConfig
