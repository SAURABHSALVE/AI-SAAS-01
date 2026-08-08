import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "node",
  clearMocks: true,
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default async () => {
  const nextJestConfig = await createJestConfig(config)();
  return {
    ...nextJestConfig,
    // nanoid ships ESM-only; override next/jest's default node_modules
    // exclusion so it still goes through the SWC transform.
    transformIgnorePatterns: ["/node_modules/(?!(nanoid)/)"],
  };
};
