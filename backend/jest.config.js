module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '@domain/(.*)': '<rootDir>/src/domain/$1',
    '@application/(.*)': '<rootDir>/src/application/$1',
    '@infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
    '@interfaces/(.*)': '<rootDir>/src/interfaces/$1',
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@shared/(.*)': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/infrastructure/database/migrations/**',
    '!src/infrastructure/database/seeders/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
