import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const out = path.join(dist, "IDUPlus-extension.zip");
const include = [
  "manifest.json",
  "content",
  "popup",
  "icons",
  "README_PL.md",
  "CHANGELOG.md"
];

try {
  execFileSync("zip", ["-r", out, ...include], { stdio: "inherit", cwd: root });
  console.log(`Packed: ${out}`);
} catch (error) {
  const powershell = path.join(
    process.env.SystemRoot || "C:\\Windows",
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe"
  );
  const literalPaths = include
    .map((entry) => path.join(root, entry).replace(/'/g, "''"))
    .map((entry) => `'${entry}'`)
    .join(", ");
  const escapedOut = out.replace(/'/g, "''");
  const command = `$items = @(${literalPaths}); Compress-Archive -LiteralPath $items -DestinationPath '${escapedOut}' -Force`;

  try {
    execFileSync(powershell, ["-NoProfile", "-Command", command], { stdio: "inherit", cwd: root });
    console.log(`Packed: ${out}`);
  } catch {
    console.error("Could not create ZIP with zip or PowerShell Compress-Archive.");
    process.exit(1);
  }
}
