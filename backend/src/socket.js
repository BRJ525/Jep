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

      socket.emit("roomCreated", sanitizeRoom(room));
      io.to(roomCode).emit("roomUpdated", sanitizeRoom(room));
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

      socket.emit("roomJoined", sanitizeRoom(room));
      io.to(roomCode).emit("roomUpdated", sanitizeRoom(room));
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

      io.to(roomCode).emit("gameStarted", sanitizeRoom(room));
      io.to(roomCode).emit("roomUpdated", sanitizeRoom(room));
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
        io.to(updatedRoom.roomCode).emit("roomUpdated", sanitizeRoom(updatedRoom));
      }
    });

    socket.on("submitAnswer", ({ roomCode, selectedAnswer }) => {
      const room = submitAnswer(rooms, roomCode, socket.id, selectedAnswer);

      if (room) {
        io.to(room.roomCode).emit("roomUpdated", sanitizeRoom(room));
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
        io.to(updatedRoom.roomCode).emit("roomUpdated", sanitizeRoom(updatedRoom));
      }
    });

    socket.on("disconnect", () => {
      Object.keys(rooms).forEach((roomCode) => {
        const room = rooms[roomCode];

        // Remove disconnected player from this room
        room.players = room.players.filter((p) => p.id !== socket.id);

        // If nobody is left, delete the room from in-server memory
        if (room.players.length === 0) {
          delete rooms[roomCode];
          console.log(`Deleted empty room: ${roomCode}`);
          return;
        }

        // If host disconnected, make the first remaining player the new host
        if (room.hostId === socket.id) {
          room.hostId = room.players[0].id;
        }

        // Update remaining players in the room
        io.to(room.roomCode).emit("roomUpdated", sanitizeRoom(room));
      });

      console.log("Disconnected:", socket.id);
    });
  });
}

function sanitizeRoom(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      selectedAnswer: player.selectedAnswer,
    })),
    gameStarted: room.gameStarted,
    currentCorrectPlayerId: room.currentCorrectPlayerId,
    hasQuestionBeenAnswered: room.hasQuestionBeenAnswered,

    questions: room.questions.map((q) => ({
      id: q.id,
      category: q.category,
      value: q.value,
      used: q.used,
    })),

    currentQuestion: room.currentQuestion
      ? {
        id: room.currentQuestion.id,
        category: room.currentQuestion.category,
        value: room.currentQuestion.value,
        text: room.currentQuestion.text,
        options: room.currentQuestion.options,
        used: room.currentQuestion.used,
      }
      : null,
  };
}

export default setupSocket;