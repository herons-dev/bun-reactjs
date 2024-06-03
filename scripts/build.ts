import {build} from "@libraries/build.ts";

build()
  .catch((e: unknown) => {
    console.log(e);
  });
