import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js','json', 'ts', 'node', 'd.ts'],
  passWithNoTests: true,
  modulePathIgnorePatterns: [
    '<rootDir>/_archive',
    '<rootDir>/node_modules',
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
    '<rootDir>/src/**/*.{ts}',
    '!**',
    '!_.*',
    '!<rootDir>/node_modules/**',

  ],
  coveragePathIgnorePatterns: [
    '_.*',
    '<rootDir>/node_modules/'
  ],
  'coverageThreshold': {
    'global': {
      'lines': 90,
      'statements': 90
    }
  }
};

export default config;
