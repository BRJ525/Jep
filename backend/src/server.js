import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import roomRoutes from "./routes/roomRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import setupSocket from "./socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomRoutes);
app.use("/api/game", gameRoutes);

setupSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});