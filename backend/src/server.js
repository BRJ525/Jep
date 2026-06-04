import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import setupSocket from "./socket.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://jep-1.onrender.com"
];

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Jeopardy backend is running.");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

setupSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});