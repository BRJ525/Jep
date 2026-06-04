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
      const room = rooms[roomCode];

      if (!room) {
        socket.emit("roomError", "Room not found.");
        return;
      }

      if (room.gameStarted) {
        socket.emit("roomError", "This game has already started. You cannot join now.");
        return;
      }

      if (room.players.length >= 4) {
        socket.emit("roomError", "This room is full.");
        return;
      }

      const nameTaken = room.players.some(
        (player) => player.name.toLowerCase() === playerName.toLowerCase()
      );

      if (nameTaken) {
        socket.emit("roomError", "That name is already taken.");
        return;
      }

      room.players.push({
        id: socket.id,
        name: playerName,
        score: 0,
      });

      socket.join(roomCode);

      socket.emit("roomJoined", room);
      io.to(roomCode).emit("roomUpdated", room);
    });

    socket.on("startGame", ({ roomCode }) => {
      const room = rooms[roomCode];

      if (!room) {
        socket.emit("roomError", "Room not found.");
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit("roomError", "Only the host can start the game.");
        return;
      }

      room.gameStarted = true;

      io.to(roomCode).emit("gameStarted", room);
      io.to(roomCode).emit("roomUpdated", room);
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

    socket.on("debugRooms", () => {
      console.log("Current rooms:", rooms);
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