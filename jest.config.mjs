import nextJest from "next/jest.js";

// next/jest wires up the SWC transform, the tsconfig path aliases and CSS /
// image stubs, so tests run against the same module resolution as the app.
const createJestConfig = nextJest({ dir: "./" });

// react-markdown and its whole unified/remark dependency chain ship as ESM
// only. Jest skips node_modules when transforming, so these have to be opted
// back in or every test that renders a brief dies on `Unexpected token export`.
const ESM_PACKAGES = [
  "react-markdown",
  "remark-.*",
  "rehype-.*",
  "micromark.*",
  "mdast-.*",
  "unist-.*",
  "hast-util-.*",
  "character-entities.*",
  "unified",
  "bail",
  "is-plain-obj",
  "trough",
  "vfile.*",
  "property-information",
  "space-separated-tokens",
  "comma-separated-tokens",
  "decode-named-character-reference",
  "html-url-attributes",
  "estree-util-is-identifier-name",
  "markdown-table",
  "longest-streak",
  "zwitch",
  "ccount",
  "escape-string-regexp",
  "stringify-entities",
  "trim-lines",
  "devlop",
];

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "stores/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ],
};

// next/jest overwrites transformIgnorePatterns, so patch it after the fact
// rather than passing it in above.
export default async function jestConfig() {
  const resolved = await createJestConfig(config)();

  resolved.transformIgnorePatterns = [
    `node_modules/(?!(${ESM_PACKAGES.join("|")})/)`,
    "^.+\.module\.(css|sass|scss)$",
  ];

  return resolved;
}
