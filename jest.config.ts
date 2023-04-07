import { Config } from 'jest';

// module.exports = {
const config: Config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js','json', 'ts', 'node', 'd.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/_archive',
    '<rootDir>/node_modules',
    '<rootDir>/.*/node_modules',
    '<rootDir>/docs',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  'collectCoverage': false,
  'coverageReporters': [
    'text',
    'json',
    'html',
    'cobertura',
  ],
  'coverageDirectory': 'coverage',
  'reporters': ['default', 'jest-junit'],

  'collectCoverageFrom': [
    // 'src/**/*.{js,jsx,ts,tsx}',
    // '!**',
    'src/api/**/*.{ts,tsx}',
    'src/web/**/*.{ts,tsx}',
    // '!_.*',
    // '!<rootDir>/src/api/**/node_modules/',
    // '!<rootDir>/src/web/.parcel-cache/',
    // '!<rootDir>/src/web/node_modules/',

    // '!<rootDir>/src/api/**/node_modules/**',
    // '!<rootDir>/src/cdk/**',
    // '!<rootDir>/src/types/**',
    // '!<rootDir>/src/web/.parcel-cache/**',

    // '!<rootDir>/_archive/**',
    // '!<rootDir>/docs/**',
    // '!<rootDir>/node_modules/**',

    // '!<rootDir>/node_modules/',
    // '!/node_modules/',
    // '!**/node_modules/',
    // '!**/node_modules',
    // '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '_.*',
    '<rootDir>/src/api/.*/node_modules/',
    '<rootDir>/src/web/.parcel-cache/',
    '<rootDir>/src/web/node_modules/',

    // '<rootDir>/node_modules/',
    // '<rootDir>/src/cdk/',
    // '<rootDir>/src/types/',
  //   '<rootDir>/_archive/',
  //   '<rootDir>/.aws-sam/',
  //   '<rootDir>/.parcel-cache/',
  //   '<rootDir>/.*/.parcel-cache/',
  //   '<rootDir>/node_modules/',
  //   '<rootDir>/.*/node_modules/',
  //   '<rootDir>/cdk.out/',
  //   '<rootDir>/dist/',
  //   '<rootDir>/data/',
  //   '<rootDir>/docs/',
  ],
  'coverageThreshold': {
    'global': {
      'lines': 90,
      'statements': 90
    }
  }
};

export default config;
