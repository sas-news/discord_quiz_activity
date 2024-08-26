import express, { Express } from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import http from "http";
import { WebSocketServer } from "ws";
import helmet from "helmet";
import { Types } from "@discord/embedded-app-sdk";

dotenv.config({ path: "../.env" });

const app: Express = express();
const port = 3690;

app.use(helmet()); // 追加

const url = `wss://${process.env.VITE_DISCORD_CLIENT_ID}.discordsays.com/.proxy/`;
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", url],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

app.use(express.json());

app.post("/api/token", async (req, res) => {
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  if (!response.ok) {
    return res.status(response.status).send({ error: "Failed to fetch token" });
  }

  const data = (await response.json()) as { access_token: string };
  const access_token = data.access_token;

  res.send({ access_token });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("connected!");

  const wsClient = ws as WebSocket & {
    on: (event: string, callback: (data: any) => void) => void;
  };

  wsClient.on("message", (data: string, isBinary?: boolean) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    }
  });

  wsClient.on("close", () => console.log("closed!"));
});

server.listen(port, () => {
  console.log(`Server listening at http://114.148.254.131:${port}`);
});
