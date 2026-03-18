import { execSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  run("npx prisma db push --skip-generate");
} else {
  console.log("> Skipping prisma db push because DATABASE_URL is not set");
}

run("npx next build");
