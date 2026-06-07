const rooms = {};

function generateRoomCode() {
  let code;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);

  return code;
}

function createRoom(hostSocketId) {
  const roomCode = generateRoomCode();

  rooms[roomCode] = {
    roomCode,
    hostSocketId,
    players: [],
    board: null,
    selectedQuestion: null,
    currentBuzz: null,
    usedQuestions: [],
    gameStarted: false
  };

  return rooms[roomCode];
}

function getRoom(roomCode) {
  return rooms[roomCode];
}

function deleteRoom(roomCode) {
  delete rooms[roomCode];
}

export {
  rooms,
  createRoom,
  getRoom,
  deleteRoom
};

export default rooms;