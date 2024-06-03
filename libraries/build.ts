import type {BuildConfig, BunPlugin} from "bun";
import * as path from "path";
import * as fs from "fs";
import type {Options} from "sass";
import {DateTime} from "luxon";

const basePath = path.join(__dirname, "..") + "/";

const sassCompile: BunPlugin = {
  name: "Sass Compile",
  async setup(build) {
    const sass = await import("sass");
    const outPath = path.join(basePath, build.config.outdir ?? "dist");

    if (!fs.existsSync(outPath)) {
      fs.mkdirSync(outPath);
    }

    build.onLoad({filter: /\.scss$/}, (args) => {
      const opts: Options<"sync"> = build.config.minify
        ? {
          style: "compressed",
        }
        : {
          sourceMap: true,
          sourceMapIncludeSources: true,
          style: "expanded",
        };

      const scss = sass.compile(args.path, opts);
      let compiledCss = scss.css;

      if (scss.sourceMap) {
        const scssFileName = path.basename(args.path);
        const mapFileName = scssFileName.substring(0, scssFileName.length - 5) + ".css.map";
        compiledCss += `/*# sourceMappingURL=${mapFileName} */`;

        fs.writeFileSync(
          path.join(outPath, mapFileName),
          JSON.stringify(scss.sourceMap),
        );
      }

      return {
        loader: "file",
        contents: compiledCss,
      };
    });
  },
};

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
      sassCompile,
      ...(config?.plugins ?? []),
    ],
  };

  const outPath = path.join(basePath, finalConfig.outdir ?? "dist") + "/";

  try {
    fs.rmSync(outPath, {
      recursive: true,
      force: true,
    });

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

    const outputAssets: string[] = [];

    o.outputs.forEach((output) => {
      let p = output.path;

      if (output.path.endsWith(".scss")) {
        p = output.path.substring(0, output.path.length - 5) + ".css";
        fs.copyFileSync(output.path, p);
        fs.rmSync(output.path);

        const cssContent = fs.readFileSync(p, {
          encoding: "utf-8",
          flag: "r",
        });

        const regex = new RegExp(/\/\*#\s*sourceMappingURL=(\S+)\s*\*\//, "gm");
        const matches = [...cssContent.matchAll(regex)];

        if (matches.length > 0) {
          const currentMapFile = path.join(outPath, matches[0][1]);

          if (fs.existsSync(currentMapFile)) {
            const newMapFile = p + ".map";
            fs.copyFileSync(currentMapFile, newMapFile);
            fs.rmSync(currentMapFile);

            const newMapFileName = path.basename(newMapFile);
            fs.writeFileSync(
              p,
              cssContent.replace(matches[0][0], matches[0][0].replace(matches[0][1], newMapFileName)),
            );

            console.info("Build: " + newMapFile.replace(basePath, ""));
            outputAssets.push(newMapFileName);
          }
        }
      }

      console.info("Build: " + p.replace(basePath, ""));
      outputAssets.push(p.replace(outPath, ""));
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
