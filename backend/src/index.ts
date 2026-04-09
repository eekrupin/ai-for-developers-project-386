import { createApp } from "./app/create-app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Backend listens on http://127.0.0.1:${env.port}`);
});
