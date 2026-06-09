class Room {
  constructor(roomCode, questions, hostId) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.hostName = "";
    this.players = [];
    this.questions = questions;

    this.currentQuestion = null;
    this.currentCorrectPlayerId = null;
    this.hasQuestionBeenAnswered = false;

    this.chooserId = null;

    this.gameStarted = false;
  }
}

export default Room;