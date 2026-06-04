import socket from "../socket";

function QuestionCard({ question, room, roomCode, isHost }) {
  const me = room.players.find((p) => p.id === socket.id);

  const correctPlayer = room.players.find(
    (p) => p.id === room.currentCorrectPlayerId
  );

  function submitAnswer(option) {
    socket.emit("submitAnswer", {
      roomCode,
      selectedAnswer: option
    });
  }

  function closeQuestion() {
    socket.emit("closeQuestion", { roomCode });
  }

  return (
    <div className="question-modal">
      <h2>
        {question.category} - ${question.value}
      </h2>

      <p className="question-text">{question.text}</p>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            key={option}
            className="answer-option"
            disabled={room.hasQuestionBeenAnswered || me?.selectedAnswer}
            onClick={() => submitAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {me?.selectedAnswer && !room.hasQuestionBeenAnswered && (
        <p className="waiting-text">You answered: {me.selectedAnswer}</p>
      )}

      {room.hasQuestionBeenAnswered && (
        <p className="buzzed-player">
          {correctPlayer?.name} answered first and earned ${question.value}!
        </p>
      )}

      {isHost && (
        <button className="small-button" onClick={closeQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
}

export default QuestionCard;