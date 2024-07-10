import {ESLint} from "eslint";
import * as path from "path";
import {$, type ShellOutput} from "bun";
import Watcher from "@libraries/watcher.ts";

const basePath = path.join(__dirname, "..") + "/";
const severities: Record<number, string> = {
  0: "off",
  1: "warning",
  2: "error",
};

async function lint() {
  const w = Watcher.newAndStart("Linting... ");
  let eslint: ESLint | null = new ESLint({
    cache: true,
    cwd: path.join(__dirname, ".."),
    errorOnUnmatchedPattern: false,
    fix: false,
    overrideConfigFile: "eslint.config.js",
  });

  let results: ESLint.LintResult[] | null = await eslint.lintFiles([
    "libraries/**/*.{ts,tsx,js,jsx}",
    "scripts/**/*.{ts,tsx,js,jsx}",
    "source/**/*.{ts,tsx,js,jsx}",
  ]);

  eslint = null;
  const lintTime = w.getRanTimeFixed(2);

  const problems = results.reduce(
    (acc, result) => acc + result.errorCount + result.warningCount,
    0,
  );

  if (problems > 0) {
    console.error("Error (" + lintTime + "s)");
    let i = 0;

    results.forEach((r) => {
      if (r.errorCount === 0 && r.warningCount === 0) {
        return;
      }

      i++;
      console.error(i.toString() + ". " + r.filePath.replace(basePath, ""));

      r.messages.forEach((m) => {
        console.error(
          " ".repeat(i.toString().length + 2)
          + "[" + severities[m.severity].toUpperCase() + " at " + m.line.toString() + ":" + m.column.toString() + "] "
          + m.message,
        );

        if (m.suggestions) {
          m.suggestions.forEach((s) => {
            console.info(" ".repeat(i.toString().length + 2) + "-> " + s.desc);
          });
        }
      });
    });

    results = null;
    return false;
  } else {
    console.info("Done (" + lintTime + "s)");
    return true;
  }
}

async function lintByCommand() {
  const w = Watcher.newAndStart("Linting... ");
  let output: ShellOutput | null = null;
  let success = false;

  try {
    output = await $`bun --silent run lint`;
    success = true;
    // eslint-disable-next-line
  } catch (e: unknown) {
  }

  const lintTime = w.getRanTimeFixed(2);

  if (success) {
    console.info("Done (" + lintTime + ")s");
  } else {
    console.error("Error (" + lintTime + ")s");
  }

  if (output && output.stdout.length > 0) {
    console.info(output.stdout);
  }

  return success;
}

export {
  lint,
  lintByCommand,
};
