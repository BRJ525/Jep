import Room from "../models/Room.js";

export function createRoomCode(rooms) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  do {
    code = "";

    for (let i = 0; i < 6; i++) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }
  } while (rooms[code]);

  return code;
}

export function createRoom(roomCode, questions, hostId) {
  return new Room(roomCode, structuredClone(questions), hostId);
}

export function isRoomHost(room, socketId) {
  return room.hostId === socketId;
}

export function findRoom(rooms, roomCode) {
  return rooms[roomCode?.trim().toUpperCase()];
}

export function addPlayerToRoom(room, player) {
  const existingPlayer = room.players.find((p) => p.id === player.id);

  if (!existingPlayer) {
    room.players.push(player);
  }
}

export function assignRandomChooser(room) {
  if (!room || room.players.length === 0) {
    if (room) room.chooserId = null;
    return null;
  }

  const randomIndex = Math.floor(Math.random() * room.players.length);
  room.chooserId = room.players[randomIndex].id;

  return room.chooserId;
}

export function getChooser(room) {
  if (!room?.chooserId) return null;

  return room.players.find((player) => player.id === room.chooserId) || null;
}

export function makePlayerChooser(room, playerId) {
  const player = room.players.find((p) => p.id === playerId);

  if (player) {
    room.chooserId = player.id;
  }

  return room.chooserId;
}

export function selectQuestion(rooms, roomCode, questionId) {
  const room = findRoom(rooms, roomCode);

  if (!room) return null;

  const question = room.questions.find((q) => q.id === questionId);

  if (!question || question.used) return room;

  question.used = true;
  room.currentQuestion = question;
  room.currentCorrectPlayerId = null;
  room.hasQuestionBeenAnswered = false;

  room.players.forEach((player) => {
    player.selectedAnswer = null;
  });

  return room;
}

export function submitAnswer(rooms, roomCode, playerId, selectedAnswer) {
  const room = findRoom(rooms, roomCode);

  if (!room || !room.currentQuestion || room.hasQuestionBeenAnswered) {
    return room;
  }

  const player = room.players.find((p) => p.id === playerId);

  if (!player) return room;

  player.selectedAnswer = selectedAnswer;

  if (selectedAnswer === room.currentQuestion.answer) {
    player.score += room.currentQuestion.value;
    room.currentCorrectPlayerId = playerId;
    room.hasQuestionBeenAnswered = true;

    makePlayerChooser(room, playerId);
  }

  return room;
}

export function closeQuestion(rooms, roomCode) {
  const room = findRoom(rooms, roomCode);

  if (!room) return null;

  room.currentQuestion = null;
  room.currentCorrectPlayerId = null;
  room.hasQuestionBeenAnswered = false;

  room.players.forEach((player) => {
    player.selectedAnswer = null;
  });

  return room;
}