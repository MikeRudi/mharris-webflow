import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Preview the published Webflow markup with this checkout's JS/CSS.
// HOME_PREVIEW_HTML can point to a saved staging response for repeatable tests.
export async function createHomePreview({ port = 4173, htmlPath = process.env.HOME_PREVIEW_HTML } = {}) {
  const html = htmlPath ? await readFile(htmlPath, "utf8") : await fetch(
    "https://imprint-engine-v1.webflow.io/home-staged"
  ).then((response) => {
    if (!response.ok) throw new Error(`Staging HTML: ${response.status}`);
    return response.text();
  });
  const previewHtml = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (script, attributes, code) => {
    return !/\bsrc\s*=/.test(attributes) && /\bmhLoad\b/.test(code) ? "" : script;
  }).replace("</head>", '<link rel="stylesheet" href="/styles.css"></head>')
    .replace("</body>", '<script defer src="/script.js"></script></body>');
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, "http://127.0.0.1").pathname;
      response.setHeader("Cache-Control", "no-store");
      if (pathname === "/script.js" || pathname === "/styles.css") {
        response.setHeader("Content-Type", pathname.endsWith(".js") ? "text/javascript" : "text/css");
        response.end(await readFile(new URL(`../src${pathname}`, import.meta.url)));
      } else if (pathname === "/" || pathname === "/home-staged") {
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(previewHtml);
      } else {
        response.statusCode = 404;
        response.end();
      }
    } catch (error) {
      response.statusCode = 500;
      response.end(error.message);
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await createHomePreview();
  console.log(`Home animation preview: ${url}`);
}
