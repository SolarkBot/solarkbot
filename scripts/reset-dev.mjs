import { execFileSync, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

function getRepoPath() {
  return process.cwd().toLowerCase();
}

function getWindowsNodeProcesses() {
  const output = execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      "Get-CimInstance Win32_Process -Filter \"Name = 'node.exe'\" | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress",
    ],
    {
      encoding: "utf8",
    }
  ).trim();

  if (!output) {
    return [];
  }

  const parsed = JSON.parse(output);
  const entries = Array.isArray(parsed) ? parsed : [parsed];

  return entries
    .filter(Boolean)
    .map((entry) => ({
      pid: Number(entry.ProcessId),
      commandLine: entry.CommandLine || "",
    }));
}

function getPosixNodeProcesses() {
  const output = execFileSync("ps", ["-ax", "-o", "pid=", "-o", "command="], {
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstSpace = line.indexOf(" ");
      if (firstSpace < 0) {
        return null;
      }

      return {
        pid: Number(line.slice(0, firstSpace).trim()),
        commandLine: line.slice(firstSpace + 1).trim(),
      };
    })
    .filter(Boolean);
}

function getNodeProcesses() {
  return process.platform === "win32"
    ? getWindowsNodeProcesses()
    : getPosixNodeProcesses();
}

function isRepoLocalNextDevProcess(processInfo) {
  if (!processInfo || processInfo.pid === process.pid || !processInfo.commandLine) {
    return false;
  }

  const commandLine = processInfo.commandLine.toLowerCase();
  const isNpmDevCommand = commandLine.includes(" run dev");
  const isNextDevCommand =
    commandLine.includes(" next dev") ||
    (commandLine.includes("next\\dist\\bin\\next") && commandLine.includes(" dev")) ||
    (commandLine.includes("next/dist/bin/next") && commandLine.includes(" dev"));

  return (
    commandLine.includes(getRepoPath()) &&
    (isNpmDevCommand || isNextDevCommand)
  );
}

function stopProcess(pid) {
  if (process.platform === "win32") {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  process.kill(pid, "SIGTERM");
}

function stopRepoLocalDevServers() {
  const processes = getNodeProcesses().filter(isRepoLocalNextDevProcess);

  if (processes.length === 0) {
    console.log("> No repo-local next dev processes found.");
    return;
  }

  for (const processInfo of processes) {
    try {
      stopProcess(processInfo.pid);
      console.log(`> Stopped dev process ${processInfo.pid}`);
    } catch (error) {
      console.warn(`> Failed to stop dev process ${processInfo.pid}: ${error.message}`);
    }
  }
}

function clearNextArtifacts() {
  const nextDirectory = path.join(process.cwd(), ".next");
  rmSync(nextDirectory, {
    recursive: true,
    force: true,
  });
  console.log("> Cleared .next");
}

function startDevServer() {
  const forwardedArgs = process.argv.slice(2).filter((arg) => arg !== "--no-start");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const npmArgs =
    forwardedArgs.length > 0
      ? ["run", "dev", "--", ...forwardedArgs]
      : ["run", "dev"];

  console.log(`> Restarting dev server with: ${npmCommand} ${npmArgs.join(" ")}`);

  const child = spawn(npmCommand, npmArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

stopRepoLocalDevServers();
clearNextArtifacts();

if (process.argv.includes("--no-start")) {
  console.log("> Skipping dev restart (--no-start).");
} else {
  startDevServer();
}
