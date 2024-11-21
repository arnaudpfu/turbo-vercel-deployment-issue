import jestGlobalConfig from '@internalpackage/jestconfig/jest.config';

export default {
    ...jestGlobalConfig,
    moduleNameMapper: {
        '\\.(css|scss)$': '@internalpackage/jestconfig/style-mock.js',
    },
    setupFiles: ['@internalpackage/jestconfig/test-env.js'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
};
