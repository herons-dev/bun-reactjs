import {build} from "@libraries/build.ts";

build({
  minify: false,
  outdir: "dev",
  publicPath: "/dev/",
  sourcemap: "external",
})
  .catch((e: unknown) => {
    console.log(e);
  });
