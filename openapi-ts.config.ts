// D-2 / C-4: Generated OpenAPI client toolchain configuration and runner.
//
// `pnpm generate:client` executes this file with Node 22 type stripping. It
// reads Data-Pulse-2 OpenAPI sources from the pinned git commit, generates
// openapi-typescript output for each source, and composes the path types into
// `src/generated/schema.d.ts`. Keeping the runner here avoids adding an
// extra scripts directory outside the slice 002 scaffold surface.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript";

/**
 * Data-Pulse-2 pin (C-4). The generator reads OpenAPI sources from this
 * commit. Sources live in `packages/contracts/openapi/` upstream:
 *   - auth.openapi.yaml     (signIn, signOut, refreshSession)
 *   - context.openapi.yaml  (getActiveContext, switch/clear context)
 */
export const DATA_PULSE_2_PIN = "62d0906" as const;

/**
 * The OpenAPI sources consumed at this slice's RF-1 boundary.
 * (See specs/001-console-foundation/contracts/rf1-auth-context.md.)
 * Paths are relative to the Data-Pulse-2 repo root at the pinned SHA.
 */
export const OPENAPI_SOURCES = [
  "packages/contracts/openapi/auth.openapi.yaml",
  "packages/contracts/openapi/context.openapi.yaml",
] as const;

/**
 * Where openapi-typescript writes the schema types (D-7). Committed,
 * not .gitignore'd, so CI is reproducible without running the generator.
 */
export const OUTPUT_PATH = "src/generated/schema.d.ts" as const;

/**
 * Console-originated requests use the dp2_session cookie automatically
 * (C-2). No Authorization: Bearer plumbing. openapi-fetch sends
 * credentials same-origin; see src/generated/client.ts.
 */
export const CREDENTIALS_MODE = "include" as const;

const DATA_PULSE_2_REPO_ENV = "DATA_PULSE_2_REPO" as const;

const SOURCE_NAMES = ["auth", "context"] as const;

const thisFilePath = fileURLToPath(import.meta.url);
const repoRoot = dirname(thisFilePath);

function resolveDataPulseRepo(): string {
  const configuredRepo = process.env[DATA_PULSE_2_REPO_ENV];
  const candidate = configuredRepo
    ? resolve(configuredRepo)
    : resolve(repoRoot, "..", "Data-Pulse-2");

  if (!existsSync(join(candidate, ".git"))) {
    throw new Error(
      `Data-Pulse-2 repo not found at ${candidate}. Set ${DATA_PULSE_2_REPO_ENV} to the repo root.`,
    );
  }

  return candidate;
}

function readPinnedSource(dataPulseRepo: string, sourcePath: string): string {
  return execFileSync("git", ["-C", dataPulseRepo, "show", `${DATA_PULSE_2_PIN}:${sourcePath}`], {
    encoding: "utf8",
    windowsHide: true,
  });
}

async function generateSourceTypes(sourceFilePath: string): Promise<string> {
  const ast = await openapiTS(pathToFileURL(sourceFilePath));
  return `${COMMENT_HEADER}${astToString(ast)}`;
}

function stripOpenApiTypescriptHeader(generatedTypes: string): string {
  return generatedTypes.startsWith(COMMENT_HEADER)
    ? generatedTypes.slice(COMMENT_HEADER.length).trim()
    : generatedTypes.trim();
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.length === 0 ? line : `    ${line}`))
    .join("\n");
}

function composeSchema(authTypes: string, contextTypes: string): string {
  return `${COMMENT_HEADER}// Source: Data-Pulse-2 @ ${DATA_PULSE_2_PIN}
// Sources:
// - ${OPENAPI_SOURCES[0]}
// - ${OPENAPI_SOURCES[1]}
//
// The upstream auth and context OpenAPI files are separate documents with
// overlapping component names, so this file namespaces each generated source
// and composes their path maps for openapi-fetch.

export namespace AuthSchema {
${indent(stripOpenApiTypescriptHeader(authTypes))}
}

export namespace ContextSchema {
${indent(stripOpenApiTypescriptHeader(contextTypes))}
}

export type paths = AuthSchema.paths & ContextSchema.paths;
export type components = AuthSchema.components & ContextSchema.components;
export type operations = AuthSchema.operations & ContextSchema.operations;
`;
}

async function generateClientSchema(): Promise<void> {
  const dataPulseRepo = resolveDataPulseRepo();
  execFileSync("git", ["-C", dataPulseRepo, "cat-file", "-e", `${DATA_PULSE_2_PIN}^{commit}`], {
    stdio: "ignore",
    windowsHide: true,
  });

  const tempDir = mkdtempSync(join(tmpdir(), "retail-tower-console-openapi-"));
  const generatedTypes = await Promise.all(
    OPENAPI_SOURCES.map(async (sourcePath, index) => {
      const sourceFilePath = join(tempDir, `${SOURCE_NAMES[index]}.openapi.yaml`);
      writeFileSync(sourceFilePath, readPinnedSource(dataPulseRepo, sourcePath), "utf8");
      return generateSourceTypes(sourceFilePath);
    }),
  );

  writeFileSync(
    resolve(repoRoot, OUTPUT_PATH),
    composeSchema(generatedTypes[0], generatedTypes[1]),
    "utf8",
  );
  console.log(`Generated ${OUTPUT_PATH} from Data-Pulse-2 @ ${DATA_PULSE_2_PIN}`);
}

if (process.argv[1] && resolve(process.argv[1]) === thisFilePath) {
  await generateClientSchema();
}
