import express, { Express } from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import http from "http";
import { createServer } from "http";
import { Server } from "socket.io";
import socket from "./socket";
import cors from "cors";
import { env } from "process";

dotenv.config({ path: "../.env" });

const app: Express = express();
const port = 3690;
const host = "127.0.0.1";
const corsOrigin = `https://${env.VITE_DISCORD_CLIENT_ID}.discordsays.com`;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
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

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.get("/api/socket", (_, res) => res.send(`Server is up`));

httpServer.listen(port, host, () => {
  console.log(`http://114.148.254.131:${port}`);

  socket({ io });
});
