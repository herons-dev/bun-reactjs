import type {BuildConfig} from "bun";
import * as path from "path";
import * as fs from "fs";
import {DateTime} from "luxon";
import {sassCompilePlugin, sassPostProcessing} from "@libraries/buildPlugins/sass.ts";

const basePath = path.join(__dirname, "..") + "/";

async function build(config?: Partial<BuildConfig>): Promise<string[] | null> {
  const finalConfig: BuildConfig = {
    minify: true,
    outdir: "build",
    sourcemap: "none",
    target: "browser",
    ...(config ?? {}),
    entrypoints: [
      "source/index.tsx",
      ...(config?.entrypoints ?? []),
    ],
    plugins: [
      sassCompilePlugin,
      ...(config?.plugins ?? []),
    ],
  };

  const outPath = path.join(basePath, finalConfig.outdir ?? "dist") + "/";

  try {
    fs.rmSync(outPath, {
      recursive: true,
      force: true,
    });

    const outputAssets: string[] = [];
    const start = DateTime.now();
    console.info("Build: Start");
    const o = await Bun.build(finalConfig);

    o.logs.forEach((log) => {
      if (log.level === "error") {
        console.error(log.message);
      } else if (log.level === "warning") {
        console.warn(log.message);
      } else {
        console.info(log.message);
      }
    });

    o.outputs.forEach((output) => {
      sassPostProcessing(output);
    });

    fs.readdirSync(outPath).forEach((f) => {
      outputAssets.push(f);
      console.info("Build: " + path.join(outPath, f).replace(basePath, ""));
    });

    fs.writeFileSync(path.join(outPath, "assets.json"), JSON.stringify(outputAssets));
    console.info("Build: Finish (" + (Math.abs(start.diffNow().get("milliseconds")) / 1000).toFixed(2) + "s)");
    return outputAssets;
  } catch (e) {
    console.error(e);
  }

  return null;
}

export {
  build,
};
