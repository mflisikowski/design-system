import { spawn } from "node:child_process";

/**
 * @param {string} command
 * @param {string[]} arguments_
 * @param {{ cwd: string; env?: NodeJS.ProcessEnv; stdio?: "capture" | "inherit" }} options
 * @returns {Promise<string>}
 */
export function run(command, arguments_, options) {
  return new Promise((resolve, reject) => {
    const capture = options.stdio !== "inherit";
    const child = spawn(command, arguments_, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(
        new Error(
          `${command} ${arguments_.join(" ")} failed with ${code}.${stdout || stderr ? `\n${stdout}\n${stderr}` : ""}`,
        ),
      );
    });
  });
}
