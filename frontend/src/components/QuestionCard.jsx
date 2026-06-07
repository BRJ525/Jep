import socket from "../socket";

function QuestionCard({ question, room, roomCode, isHost }) {
  const players = room?.players || [];
  const me = players.find((p) => p.id === socket.id);
  const correctPlayer = players.find(
    (p) => p.id === room?.currentCorrectPlayerId
  );

  function submitAnswer(option) {
    socket.emit("submitAnswer", {
      roomCode,
      selectedAnswer: option,
    });
  }

  function closeQuestion() {
    socket.emit("closeQuestion", { roomCode });
  }

  if (!question || !room) {
    return (
      <div className="question-card">
        <h2>Loading question...</h2>
      </div>
    );
  }

  return (
    <div className="question-card polished-question-card">
      <div className="question-top">
        <p className="question-eyebrow">{question.category}</p>
        <h2>${question.value}</h2>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            className="answer-btn"
            key={option}
            onClick={() => submitAnswer(option)}
            disabled={me?.selectedAnswer || room.hasQuestionBeenAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {me?.selectedAnswer && !room.hasQuestionBeenAnswered && (
        <div className="answer-status incorrect">
          <div>INCORRECT</div>
          <div>
            You Answered: <strong>{me.selectedAnswer}</strong>
          </div>
        </div>
      )}

      {room.hasQuestionBeenAnswered && (
        <div className="correct-status">
          {correctPlayer ? (
            <>
              <strong>{correctPlayer.name}</strong> answered first and earned{" "}
              <strong>${question.value}</strong>!
            </>
          ) : (
            <>Question complete.</>
          )}
        </div>
      )}

      {isHost && (
        <button className="primary-btn next-question-btn" onClick={closeQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
}

export default QuestionCard;