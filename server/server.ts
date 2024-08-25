import express, { Express } from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import http from "http";
import { WebSocketServer } from "ws";
dotenv.config({ path: "../.env" });

const app: Express = express();
const port = 3001;

// Allow express to parse JSON bodies
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

  const responseData: { access_token: string } = await response.json();

  if (!response.ok) {
    return res.status(response.status).send({ error: "Failed to fetch token" });
  }

  const access_token = responseData.access_token;

  res.send({ access_token });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

let count = 0;

wss.on("connection", (ws) => {
  console.log("クライアントが接続されました");

  ws.on("message", (message) => {
    console.log("受信メッセージ:", message);
    count++;
    ws.send(`カウントは ${count} です`);
  });

  ws.on("close", () => {
    console.log("クライアントが切断されました");
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
