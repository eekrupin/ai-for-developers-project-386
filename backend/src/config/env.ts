const DEFAULT_PORT = 3000;
const DEFAULT_CORS_ORIGIN = "http://127.0.0.1:5173";

function readPort(rawPort: string | undefined): number {
  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const port = Number.parseInt(rawPort, 10);

  if (Number.isNaN(port) || port < 1) {
    return DEFAULT_PORT;
  }

  return port;
}

export const env = {
  port: readPort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
};
