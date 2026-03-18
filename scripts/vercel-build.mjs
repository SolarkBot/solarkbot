import { execSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

function getDatabaseHost(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

run("npx prisma generate");

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
