import {ESLint} from "eslint";
import * as path from "path";
import {DateTime} from "luxon";
import {$} from "bun";

const basePath = path.join(__dirname, "..") + "/";
const severities: Record<number, string> = {
  0: "off",
  1: "warning",
  2: "error",
};

async function lint() {
  const start = DateTime.now();
  let eslint: ESLint | null = new ESLint({
    cache: true,
    cwd: path.join(__dirname, ".."),
    errorOnUnmatchedPattern: false,
    fix: false,
    overrideConfigFile: "eslint.config.js",
  });

  const results = await eslint.lintFiles([
    "libraries/**/*.{ts,tsx,js,jsx}",
    "scripts/**/*.{ts,tsx,js,jsx}",
    "source/**/*.{ts,tsx,js,jsx}",
  ]);

  eslint = null;

  const problems = results.reduce(
    (acc, result) => acc + result.errorCount + result.warningCount,
    0,
  );

  if (problems > 0) {
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

    console.error("ESLint: Errors found (" + (Math.abs(start.diffNow().get("milliseconds")) / 1000).toFixed(2) + ")");
    return false;
  } else {
    console.info("ESLint: No errors found (" + (Math.abs(start.diffNow().get("milliseconds")) / 1000).toFixed(2) + ")");
    return true;
  }
}

async function lintByCommand() {
  const start = DateTime.now();
  console.info("ESLint: Start");

  try {
    const output = await $`bun --silent run lint`;

    if (output.stdout.length > 0) {
      console.info(output.stdout);
    }

    console.info("ESLint: Finish (" + (Math.abs(start.diffNow().get("milliseconds")) / 1000).toFixed(2) + "s)");
    return true;
    // eslint-disable-next-line
  } catch (e: unknown) {
    console.error("ESLint: Errors found");
  }

  return false;
}

export {
  lint,
  lintByCommand,
};
