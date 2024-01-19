/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    testRegex: '(int|unit).test.ts',
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coveragePathIgnorePatterns: [
        "node_modules",
        "src/models",
        "src/op",
        "src/routes",
        "src/types",
        "src/rpc",
        "src/Index.ts",
        "src/PostsWorker.ts",
        "src/PostsMgr.test.ts",
        "src/feed/FeedAlgorithm.ts",
        ".mock.ts"
    ]
};