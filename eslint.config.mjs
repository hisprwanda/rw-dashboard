import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['build/**', '.d2/**', 'node_modules/**', 'src/locales/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginQuery.configs['flat/recommended'],
    {
        files: ['src/**/*.{ts,tsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,

            // Legacy debt: warnings for now, promoted to errors in Phase 11.
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'react/prop-types': 'off',
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/no-static-element-interactions': 'warn',
            'jsx-a11y/no-noninteractive-element-interactions': 'warn',
            'jsx-a11y/label-has-associated-control': 'warn',
            'jsx-a11y/no-autofocus': 'warn',
            'jsx-a11y/anchor-is-valid': 'warn',
            'jsx-a11y/alt-text': 'warn',
            'jsx-a11y/img-redundant-alt': 'warn',
            'react/no-unescaped-entities': 'warn',
            'react/display-name': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            // The DHIS2 data engine and the query client are app-wide singletons, not inputs.
            '@tanstack/query/exhaustive-deps': [
                'error',
                {
                    allowlist: {
                        variables: ['engine', 'queryClient'],
                        types: ['DataEngine', 'QueryClient'],
                    },
                },
            ],
            // A local variable named like an import silently replaces it
            // (e.g. state `analyticsQuery` hid the imported factory -> "not a function").
            '@typescript-eslint/no-shadow': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            '@typescript-eslint/no-unused-expressions': 'warn',
            'no-empty': 'warn',
            'prefer-const': 'warn',
        },
    },
    {
        // New architecture: stricter from day one.
        files: ['src/app/**', 'src/features/**', 'src/shared/**'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'react-hooks/exhaustive-deps': 'error',
            '@typescript-eslint/no-shadow': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.name='createContext'], CallExpression[callee.property.name='createContext']",
                    message:
                        'No React Context for app state: use TanStack Query (server state) or a Redux slice (client state).',
                },
                {
                    selector: "CallExpression[callee.name='useContext'], CallExpression[callee.property.name='useContext']",
                    message:
                        'No React Context for app state: use TanStack Query (server state) or a Redux slice (client state).',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@/features/*/*'],
                            message:
                                'Import a feature through its public barrel: @/features/<name>',
                        },
                        {
                            group: ['../../*'],
                            message: 'Use the @/ alias instead of deep relative imports.',
                        },
                    ],
                    paths: [
                        {
                            name: '@/context/AuthContext',
                            message:
                                'AuthContext is legacy. Use feature hooks / Redux selectors.',
                        },
                    ],
                },
            ],
        },
    },
    prettier
)
