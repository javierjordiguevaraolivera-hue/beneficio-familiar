import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import next from "next";
import selfsigned from "selfsigned";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== "production" && !process.argv.includes("--prod");
const hostname = process.env.HOSTNAME || "localhost";
const httpPort = Number(process.env.HTTP_PORT || 3000);
const httpsPort = Number(process.env.HTTPS_PORT || 3443);
const certDir = join(__dirname, ".cert");
const keyPath = join(certDir, "localhost-key.pem");
const certPath = join(certDir, "localhost-cert.pem");

function ensureCertificate() {
  if (existsSync(keyPath) && existsSync(certPath)) {
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  }

  mkdirSync(certDir, { recursive: true });

  const pems = selfsigned.generate(
    [
      { name: "commonName", value: hostname },
      { name: "countryName", value: "US" },
    ],
    {
      algorithm: "sha256",
      days: 365,
      keySize: 2048,
      extensions: [
        {
          name: "subjectAltName",
          altNames: [
            { type: 2, value: hostname },
            { type: 2, value: "localhost" },
            { type: 7, ip: "127.0.0.1" },
          ],
        },
      ],
    }
  );

  writeFileSync(keyPath, pems.private, { mode: 0o600 });
  writeFileSync(certPath, pems.cert);

  return {
    key: pems.private,
    cert: pems.cert,
  };
}

const app = next({ dev, hostname, port: httpPort });
const handle = app.getRequestHandler();

await app.prepare();

const requestHandler = (req, res) => {
  handle(req, res);
};

createHttpServer(requestHandler).listen(httpPort, hostname, () => {
  console.log(`HTTP ready on http://${hostname}:${httpPort}`);
});

createHttpsServer(ensureCertificate(), requestHandler).listen(httpsPort, hostname, () => {
  console.log(`HTTPS ready on https://${hostname}:${httpsPort}`);
});
