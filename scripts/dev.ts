import * as path from "path";
import type {WatchEventType} from "fs";
import * as fs from "fs";
import {$, type Server, type ServerWebSocket} from "bun";
import {DateTime} from "luxon";
import {lintByCommand} from "@libraries/eslint.ts";

const HOSTNAME = process.env["HOST"] ?? "127.0.0.1";
const PORT = parseInt(process.env["PORT"] ?? "1290");
const OUTDIR = process.env["OUTDIR"] ?? "dev";
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Application</title>
    <!--[STYLES]-->
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<script src="/${OUTDIR}/index.js"></script>
<script>
    function connectWs() {
        const socket = new WebSocket("ws://" + location.host + "/ws/");
        
        socket.onmessage = function(e) {
          if (e.data === "reload") {
            location.reload();
          }
        }
        
        socket.onclose = function(e) {
          console.error(e);
          setTimeout(function() {
            connectWs();
          }, 1000);
        }
        
        socket.onerror = function(e) {
          console.error(e);
          socket.close();
        }
    }
    
    connectWs();
</script>
</body>
</html>`;

console.info("URL: http://" + HOSTNAME + ":" + PORT.toString());

let parsedHtml = HTML;
let buildTimeout: Timer;
let sockets: ServerWebSocket[] = [];
let isBuilding = false;

async function build() {
  const lintResult = await lintByCommand();

  if (!lintResult) {
    return false;
  }

  try {
    await $`bun --silent run build-dev`;
    // eslint-disable-next-line
  } catch (e: unknown) {
    return false;
  }

  try {
    let styles = "";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: string[] = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", OUTDIR, "assets.json"), {
        encoding: "utf8",
        flag: "r",
      }),
    );

    result.forEach((fn) => {
      if (!fn.endsWith(".css")) {
        return;
      }

      styles += `<link rel="stylesheet" href="/${OUTDIR}/${fn}">`;
    });

    parsedHtml = HTML.replace("<!--[STYLES]-->", styles);

    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
}

function watchListener(_: WatchEventType, filename: string | null) {
  while (isBuilding) {
    Bun.sleepSync(1000);
  }

  clearTimeout(buildTimeout);

  buildTimeout = setTimeout(() => {
    isBuilding = true;
    console.info("--- " + DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss") + " ---");

    if (filename?.startsWith("scripts/")) {
      lintByCommand().catch((e: unknown) => {
        console.error(e);
      });
      return;
    } else {
      console.info("Watcher: Source code changed");
    }

    build()
      .then((isOk) => {
        if (!isOk) {
          return;
        }

        sockets.forEach((ws) => {
          if (ws.readyState !== 1) {
            return;
          }

          ws.sendText("reload");
        });

        console.info("Watcher: Send reload signal");
      })
      .catch((e: unknown) => {
        console.error(e);
      })
      .finally(() => {
        isBuilding = false;
      });
  }, 250);
}

["libraries", "scripts", "source"].forEach((fp) => {
  fs.watch(
    path.join(__dirname, "..", fp),
    {recursive: true},
    (_: WatchEventType, filename: string | null) => {
      watchListener(_, fp + "/" + (filename ?? ""));
    },
  );
});

fs.watch(path.join(__dirname, "..", "eslint.config.js"), {recursive: true}, watchListener);

build().catch((e: unknown) => {
  console.error(e);
});

Bun.serve({
  hostname: HOSTNAME,
  port: PORT,
  reusePort: true,
  fetch(req: Request, server: Server): Response | Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/" + OUTDIR + "/")) {
      const filePath = path.join(__dirname, "..", url.pathname);
      console.info(req.method + ": " + url.pathname);

      if (fs.existsSync(filePath)) {
        return new Response(Bun.file(filePath));
      }
    } else if (url.pathname === "/ws/") {
      if (server.upgrade(req)) {
        return new Response(null);
      }
      return new Response("Upgrade failed", {status: 500});
    }

    return new Response(parsedHtml, {headers: [["Content-Type", "text/html"]]});
  },
  error() {
    return new Response(null, {status: 404});
  },
  websocket: {
    // eslint-disable-next-line
    message(_: ServerWebSocket): void | Promise<void> {
    },
    open(ws: ServerWebSocket): void | Promise<void> {
      sockets.push(ws);
    },
    close(ws: ServerWebSocket): void | Promise<void> {
      sockets = sockets.filter((w) => w !== ws);
    },
  },
});
