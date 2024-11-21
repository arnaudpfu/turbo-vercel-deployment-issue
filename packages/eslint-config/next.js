/** @type {import("eslint").Linter.Config} */
module.exports = {
    extends: ['eslint:recommended', 'prettier', require.resolve('@vercel/style-guide/eslint/next'), 'turbo'],
    globals: {
        React: true,
        JSX: true,
    },
    env: {
        jest: true,
        node: true,
        browser: true,
    },
    plugins: ['only-warn', '@typescript-eslint'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            
            typescript: {
                alwaysTryTypes: true,
                project: ['tsconfig.json', 'package/tsconfig.json'],
            },
            alias: {
                map: [
                    ['@/app', './app/*'],
                    ['@/components', './components/*'],
                    ['@/hooks', './hooks/*'],
                    ['@/lib', './lib/*'],
                    ['@/middlewares', './middlewares/*'],
                    ['@/model', './model/*'],
                    ['@/navigation', './navigation/*'],
                    ['@/packages', './packages/*'],
                ],
                extensions: ['.ts', '.tsx'],
            },
        },
    },
    ignorePatterns: ['.*.js', 'node_modules/'],
    overrides: [
        {
            files: ['*.js?(x)', '*.ts?(x)'],
        },
    ],
};
