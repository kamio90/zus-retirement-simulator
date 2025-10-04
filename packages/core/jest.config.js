module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/src'],
  moduleNameMapper: {
    '^@types$': '<rootDir>/../types/src/index.ts',
    '^@types/(.*)$': '<rootDir>/../types/src/$1',
  },
};
