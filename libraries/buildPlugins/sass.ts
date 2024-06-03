import type {BuildArtifact, BunPlugin} from "bun";
import path from "path";
import fs from "fs";
import type {Options} from "sass";

const sassCompilePlugin: BunPlugin = {
  name: "Sass Compile",
  async setup(build) {
    const sass = await import("sass");
    const outPath = path.join(process.cwd(), build.config.outdir ?? "dist");

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

      const scssFileName = path.basename(args.path);
      const cssFileName = scssFileName.substring(0, scssFileName.length - 5) + ".css";
      const scss = sass.compile(args.path, opts);
      let compiledCss = scss.css;

      if (scss.sourceMap) {
        const mapFileName = scssFileName.substring(0, scssFileName.length - 5) + ".css.map";
        compiledCss += `/*# sourceMappingURL=${mapFileName} */`;

        fs.writeFileSync(path.join(outPath, mapFileName), JSON.stringify(scss.sourceMap));
      }

      fs.writeFileSync(path.join(outPath, cssFileName), compiledCss);

      return {
        loader: "file",
        contents: "",
      };
    });
  },
};

function sassPostProcessing(output: BuildArtifact) {
  if (output.path.endsWith(".scss")) {
    fs.rmSync(output.path);
  }
}

export {
  sassCompilePlugin,
  sassPostProcessing,
};
