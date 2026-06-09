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
  isRoomHost,
} from "./utils/gameLogic.js";

const questions = JSON.parse(
  fs.readFileSync(new URL("./data/questions.json", import.meta.url))
);

const rooms = {};
const questionTimers = {};

function clearQuestionTimer(roomCode) {
  if (questionTimers[roomCode]) {
    clearInterval(questionTimers[roomCode]);
    delete questionTimers[roomCode];
  }
}

function startQuestionTimer(io, roomCode) {
  clearQuestionTimer(roomCode);

  let timeLeft = 10;
  const totalTime = 10;

  io.to(roomCode).emit("questionTimer", {
    timeLeft,
    totalTime,
  });

  questionTimers[roomCode] = setInterval(() => {
    const room = rooms[roomCode];

    if (!room || !room.currentQuestion || room.hasQuestionBeenAnswered) {
      clearQuestionTimer(roomCode);
      return;
    }

    timeLeft -= 1;

    io.to(roomCode).emit("questionTimer", {
      timeLeft,
      totalTime,
    });

    if (timeLeft <= 0) {
      clearQuestionTimer(roomCode);

      room.hasQuestionBeenAnswered = true;
      room.currentCorrectPlayerId = null;

      io.to(roomCode).emit("roomUpdated", sanitizeRoom(room));
      io.to(roomCode).emit("questionTimer", {
        timeLeft: 0,
        totalTime,
      });
    }
  }, 1000);
}

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("createRoom", ({ playerName }) => {
      const hostName = playerName?.trim();

      if (!hostName) {
        socket.emit("roomError", "Name is required.");
        return;
      }

      const roomCode = createRoomCode(rooms);
      const room = createRoom(roomCode, questions, socket.id);

      room.hostName = hostName;
      rooms[roomCode] = room;

      socket.join(roomCode);

      socket.emit("roomCreated", sanitizeRoom(room));
      io.to(roomCode).emit("roomUpdated", sanitizeRoom(room));
    });

    socket.on("joinRoom", ({ playerName, roomCode }) => {
      const cleanedRoomCode = roomCode?.trim().toUpperCase();
      const cleanedPlayerName = playerName?.trim();

      const room = rooms[cleanedRoomCode];

      if (!cleanedPlayerName) {
        socket.emit("roomError", "Name is required.");
        return;
      }

      if (!room) {
        socket.emit("roomError", "Room not found");
        return;
      }

      if (room.gameStarted) {
        socket.emit("roomError", "This game has already started");
        return;
      }

      if (room.players.length >= 4) {
        socket.emit("roomError", "This room is full");
        return;
      }

      if (room.hostName?.toLowerCase() === cleanedPlayerName.toLowerCase()) {
        socket.emit("roomError", "That name is already taken by the host");
        return;
      }

      const nameTaken = room.players.some(
        (player) => player.name.toLowerCase() === cleanedPlayerName.toLowerCase()
      );

      if (nameTaken) {
        socket.emit("roomError", "That name is already taken");
        return;
      }

      addPlayerToRoom(room, new Player(socket.id, cleanedPlayerName));

      socket.join(cleanedRoomCode);

      socket.emit("roomJoined", sanitizeRoom(room));
      io.to(cleanedRoomCode).emit("roomUpdated", sanitizeRoom(room));
    });

    socket.on("startGame", ({ roomCode }) => {
      const room = findRoom(rooms, roomCode);

      if (!room) {
        socket.emit("roomError", "Room not found.");
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit("roomError", "Only the host can start the game");
        return;
      }

      if (room.players.length < 1) {
        socket.emit("roomError", "You need at least 1 player to start.");
        return;
      }

      room.gameStarted = true;

      io.to(room.roomCode).emit("gameStarted", sanitizeRoom(room));
      io.to(room.roomCode).emit("roomUpdated", sanitizeRoom(room));
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
        startQuestionTimer(io, updatedRoom.roomCode);
      }
    });

    socket.on("submitAnswer", ({ roomCode, selectedAnswer }) => {
      const room = findRoom(rooms, roomCode);

      if (!room) return;

      if (isRoomHost(room, socket.id)) {
        socket.emit("roomError", "The host cannot answer questions.");
        return;
      }

      const updatedRoom = submitAnswer(
        rooms,
        roomCode,
        socket.id,
        selectedAnswer
      );

      if (updatedRoom) {
        if (updatedRoom.hasQuestionBeenAnswered) {
          clearQuestionTimer(updatedRoom.roomCode);
        }

        io.to(updatedRoom.roomCode).emit("roomUpdated", sanitizeRoom(updatedRoom));
      }
    });

    socket.on("closeQuestion", ({ roomCode }) => {
      const room = findRoom(rooms, roomCode);

      if (!room) return;

      if (!isRoomHost(room, socket.id)) {
        socket.emit("roomError", "Only the host can advance questions.");
        return;
      }

      clearQuestionTimer(room.roomCode);

      const updatedRoom = closeQuestion(rooms, roomCode);

      if (updatedRoom) {
        io.to(updatedRoom.roomCode).emit("roomUpdated", sanitizeRoom(updatedRoom));

        io.to(updatedRoom.roomCode).emit("questionTimer", {
          timeLeft: 10,
          totalTime: 10,
        });
      }
    });

    socket.on("disconnect", () => {
      Object.keys(rooms).forEach((roomCode) => {
        const room = rooms[roomCode];

        if (room.hostId === socket.id) {
          clearQuestionTimer(room.roomCode);
          io.to(room.roomCode).emit(
            "roomError",
            "The host left. The room has closed."
          );
          delete rooms[roomCode];
          console.log(`Deleted room because host left: ${roomCode}`);
          return;
        }

        room.players = room.players.filter((p) => p.id !== socket.id);

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
    hostName: room.hostName,

    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      selectedAnswer: player.selectedAnswer,
      hasAnswered: Boolean(player.selectedAnswer),
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