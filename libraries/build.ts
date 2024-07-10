import type {BuildConfig} from "bun";
import * as path from "path";
import * as fs from "fs";
import {sassCompilePlugin, sassPostProcessing} from "@libraries/buildPlugins/sass.ts";
import Watcher from "@libraries/watcher.ts";

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
  const w = Watcher.newAndStart("Building... ");

  try {
    fs.rmSync(outPath, {
      recursive: true,
      force: true,
    });

    const outputAssets: string[] = [];
    const o = await Bun.build(finalConfig);

    o.outputs.forEach((output) => {
      sassPostProcessing(output);
    });

    w.stop();
    console.info("Done (" + w.getRanTimeFixed(2) + "s)");

    o.logs.forEach((log) => {
      if (log.level === "error") {
        console.error(log.message);
      } else if (log.level === "warning") {
        console.warn(log.message);
      } else {
        console.info(log.message);
      }
    });

    console.info("Build outputs:");

    fs.readdirSync(outPath).forEach((f) => {
      outputAssets.push(f);
      console.info(". " + path.join(outPath, f).replace(basePath, ""));
    });

    fs.writeFileSync(path.join(outPath, "assets.json"), JSON.stringify(outputAssets));
    return outputAssets;
  } catch (e) {
    console.error("Error (" + w.getRanTimeFixed(2) + "s)");
    console.error(e);
  }

  return null;
}

export {
  build,
};
