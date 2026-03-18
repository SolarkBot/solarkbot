import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function run(command) {
  console.log(`> ${command}`);

  try {
    const output = execSync(command, {
      stdio: "pipe",
      env: process.env,
      encoding: "utf8",
    });

    if (output) {
      process.stdout.write(output);
    }

    return output;
  } catch (error) {
    if (error.stdout) {
      process.stdout.write(error.stdout);
    }

    if (error.stderr) {
      process.stderr.write(error.stderr);
    }

    error.commandOutput = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    throw error;
  }
}

function getDatabaseHost(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isProductionBuildEnvironment() {
  return process.env.CI === "true" || process.env.VERCEL === "1";
}

function hasGeneratedPrismaClient() {
  return existsSync(
    path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js")
  );
}

function isWindowsPrismaEngineLockError(error) {
  if (process.platform !== "win32") {
    return false;
  }

  const output = error?.commandOutput || "";
  return (
    output.includes("EPERM: operation not permitted, rename") &&
    output.includes("query_engine-windows.dll.node")
  );
}

function getPrismaLockGuidance() {
  return [
    "> Prisma generate hit a Windows file lock on query_engine-windows.dll.node.",
    "> Another local Node or Next.js process is likely holding the Prisma engine open.",
    "> Stop local dev servers or run `npm run dev:reset`, then try the build again.",
  ].join("\n");
}

function runPrismaGenerate() {
  try {
    run("npx prisma generate");
  } catch (error) {
    if (isProductionBuildEnvironment() || !isWindowsPrismaEngineLockError(error)) {
      throw error;
    }

    const guidance = getPrismaLockGuidance();
    if (!hasGeneratedPrismaClient()) {
      throw new Error(
        `${guidance}\n> No generated Prisma client was found, so the build cannot continue.`
      );
    }

    console.warn(guidance);
    console.warn("> Reusing the existing generated Prisma client for this local build.");
  }
}

runPrismaGenerate();

const databaseUrl = process.env.DATABASE_URL;
const shouldPushSchema = process.env.PRISMA_DB_PUSH_ON_BUILD === "true";
const databaseHost = databaseUrl ? getDatabaseHost(databaseUrl) : null;
const isLocalDatabase =
  databaseHost === "localhost" ||
  databaseHost === "127.0.0.1" ||
  databaseHost === "::1";

if (!databaseUrl) {
  console.log("> Skipping prisma db push because DATABASE_URL is not set");
} else if (!shouldPushSchema) {
  console.log(
    "> Skipping prisma db push because PRISMA_DB_PUSH_ON_BUILD is not true"
  );
} else if (isLocalDatabase) {
  console.log(
    `> Skipping prisma db push because DATABASE_URL points to local host (${databaseHost})`
  );
} else {
  run("npx prisma db push --skip-generate");
}

run("npx next build");
