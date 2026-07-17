#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const siteName = process.argv[2] || "imprint-engine";
const watchDirRel = path.join("sites", siteName, "src");
const watchDir = path.join(process.cwd(), watchDirRel);

let timer = null;
let running = false;
let queued = false;

function runGit(args) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function hasChanges() {
  return runGit(["status", "--short", "--", watchDirRel]).length > 0;
}

function syncChanges() {
  if (running) {
    queued = true;
    return;
  }

  running = true;

  try {
    if (!hasChanges()) return;

    runGit(["add", watchDirRel]);
    runGit(["commit", "-m", `Dev sync ${siteName}`]);
    runGit(["push"]);

    console.log(`[${new Date().toLocaleTimeString()}] pushed ${siteName}`);
  } catch (error) {
    console.error(error.stderr || error.message);
  } finally {
    running = false;

    if (queued) {
      queued = false;
      scheduleSync();
    }
  }
}

function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(syncChanges, 1000);
}

if (!fs.existsSync(watchDir)) {
  console.error(`Missing folder: ${watchDir}`);
  process.exit(1);
}

console.log(`Watching ${watchDir}`);
console.log("Save in VS Code, then refresh Webflow after the push message.");

fs.watch(watchDir, { recursive: true }, scheduleSync);
