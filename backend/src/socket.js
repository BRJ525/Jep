import fs from "fs";
import Player from "./models/Player.js";

import {
  createRoomCode,
  createRoom,
  findRoom,
  addPlayerToRoom,
  selectQuestion,
  submitAnswer,
  closeQuestion,
  isRoomHost
} from "./utils/gameLogic.js";

const questions = JSON.parse(
  fs.readFileSync(new URL("./data/questions.json", import.meta.url))
);

const rooms = {};

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("createRoom", ({ playerName }) => {
      if (!playerName?.trim()) {
        socket.emit("roomError", "Name is required.");
        return;
      }

      const roomCode = createRoomCode(rooms);
      const room = createRoom(roomCode, questions, socket.id);

      const host = new Player(socket.id, playerName.trim());
      room.players.push(host);

      rooms[roomCode] = room;
      socket.join(roomCode);

      socket.emit("roomCreated", room);
      io.to(roomCode).emit("roomUpdated", room);
    });

    socket.on("joinRoom", ({ playerName, roomCode }) => {
      if (!playerName?.trim()) {
        socket.emit("roomError", "Name is required.");
        return;
      }

      const room = findRoom(rooms, roomCode);

      if (!room) {
        socket.emit("roomError", "Invalid room code.");
        return;
      }

      if (room.players.length >= 4) {
        socket.emit("roomError", "Room is full.");
        return;
      }

      const player = new Player(socket.id, playerName.trim(), false);
      addPlayerToRoom(room, player);

      socket.join(room.roomCode);

      socket.emit("roomJoined", room);
      io.to(room.roomCode).emit("roomUpdated", room);
    });

    socket.on("startGame", ({ roomCode }) => {
      const room = findRoom(rooms, roomCode);
      if (!room) return;
    
      if (!isRoomHost(room, socket.id)) {
        socket.emit("roomError", "Only the host can start the game.");
        return;
      }

      room.gameStarted = true;

      io.to(room.roomCode).emit("gameStarted", room);
      io.to(room.roomCode).emit("roomUpdated", room);
    });

    socket.on("selectQuestion", ({ roomCode, questionId }) => {
      const room = findRoom(rooms, roomCode);
      if (!room) return;

      if (!isRoomHost(room, socket.id)) {
        socket.emit("roomError", "Only the host can select questions.");
        return;
      }

      const updatedRoom = selectQuestion(rooms, roomCode, questionId);

      if (updatedRoom) {
        io.to(updatedRoom.roomCode).emit("roomUpdated", updatedRoom);
      }
    });

    socket.on("submitAnswer", ({ roomCode, selectedAnswer }) => {
      const room = submitAnswer(rooms, roomCode, socket.id, selectedAnswer);

      if (room) {
        io.to(room.roomCode).emit("roomUpdated", room);
      }
    });

    socket.on("closeQuestion", ({ roomCode }) => {
      const room = findRoom(rooms, roomCode);
      if (!room) return;

      if (!isRoomHost(room, socket.id)) {
        socket.emit("roomError", "Only the host can advance questions.");
        return;
      }

      const updatedRoom = closeQuestion(rooms, roomCode);

      if (updatedRoom) {
        io.to(updatedRoom.roomCode).emit("roomUpdated", updatedRoom);
      }
    });

    socket.on("disconnect", () => {
      Object.values(rooms).forEach((room) => {
        room.players = room.players.filter((p) => p.id !== socket.id);

        if (room.hostId === socket.id && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }

        io.to(room.roomCode).emit("roomUpdated", room);
      });

      console.log("Disconnected:", socket.id);
    });
  });
}

export default setupSocket;