module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^@types$': '<rootDir>/../types/src/index.ts',
    '^@types/(.*)$': '<rootDir>/../types/src/$1',
  },
};
