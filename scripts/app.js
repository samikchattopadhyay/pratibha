#!/usr/bin/env node

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PID_FILE = path.join(__dirname, ".app.pid");

function getPid() {
  try {
    return parseInt(fs.readFileSync(PID_FILE, "utf-8").trim());
  } catch {
    return null;
  }
}

function savePid(pid) {
  fs.writeFileSync(PID_FILE, pid.toString());
}

function removePidFile() {
  try {
    fs.unlinkSync(PID_FILE);
  } catch {}
}

function isProcessRunning(pid) {
  try {
    // Send signal 0 to check if process exists
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function stopApp() {
  const pid = getPid();
  if (!pid) {
    console.log("ℹ️  App is not running");
    return;
  }

  if (!isProcessRunning(pid)) {
    console.log("ℹ️  App process not found, cleaning up...");
    removePidFile();
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
    console.log(`✓ Stopped app (PID: ${pid})`);
    removePidFile();

    // Wait a moment for graceful shutdown
    let attempts = 0;
    const interval = setInterval(() => {
      if (!isProcessRunning(pid) || attempts > 10) {
        clearInterval(interval);
        if (isProcessRunning(pid)) {
          process.kill(pid, "SIGKILL");
          console.log("  (forced kill)");
        }
      }
      attempts++;
    }, 200);
  } catch (err) {
    console.error("✗ Error stopping app:", err.message);
  }
}

function startApp() {
  // Stop if already running
  stopApp();

  // Wait a moment before starting
  setTimeout(() => {
    console.log("Starting app...\n");

    const appProcess = spawn("npm", ["run", "dev"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      shell: true,
    });

    savePid(appProcess.pid);
    console.log(`✓ App started (PID: ${appProcess.pid})`);
    console.log("  Running on http://localhost:3000\n");

    appProcess.on("exit", () => {
      removePidFile();
    });

    // Handle cleanup on exit
    process.on("SIGINT", () => {
      stopApp();
      process.exit(0);
    });
  }, 500);
}

const command = process.argv[2];

if (command === "start") {
  startApp();
} else if (command === "stop") {
  stopApp();
  process.exit(0);
} else {
  console.log("Usage: app start|stop");
  console.log("\nExamples:");
  console.log("  app start   - Start the development server");
  console.log("  app stop    - Stop the development server");
  process.exit(1);
}
