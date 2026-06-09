import socket from "../socket";

function QuestionCard({ question, room, roomCode, isHost, timer }) {
  const players = room?.players || [];
  const me = players.find((player) => player.id === socket.id);

  const correctPlayer = players.find(
    (player) => player.id === room?.currentCorrectPlayerId
  );

  const timeLeft = timer?.timeLeft ?? 10;
  const totalTime = timer?.totalTime ?? 10;
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 360 : 0;

  function submitAnswer(option) {
    if (isHost) return;
    if (me?.selectedAnswer || me?.hasAnswered) return;
    if (room.hasQuestionBeenAnswered) return;

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
    <div className="question-card">
      <div className="question-card-header">
        <div>
          <p className="question-category">{question.category}</p>
          <h2>${question.value}</h2>
        </div>

        <div
          className="circle-timer"
          style={{
            "--progress": `${progress}deg`,
          }}
        >
          <span>{timeLeft}</span>
        </div>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            key={option}
            className="answer-option"
            onClick={() => submitAnswer(option)}
            disabled={
              isHost ||
              me?.selectedAnswer ||
              me?.hasAnswered ||
              room.hasQuestionBeenAnswered
            }
          >
            {option}
          </button>
        ))}
      </div>

      {isHost && !room.hasQuestionBeenAnswered && (
        <div className="answer-status waiting-status">
          <strong>HOST VIEW</strong>
          <span>Waiting for players to answer...</span>
        </div>
      )}

      {!isHost && me?.selectedAnswer && !room.hasQuestionBeenAnswered && (
        <div className="answer-status waiting-status">
          <strong>ANSWERED</strong>
          <span>You answered: {me.selectedAnswer}</span>
        </div>
      )}

      {room.hasQuestionBeenAnswered && (
        <div className="answer-status result-status">
          {correctPlayer ? (
            correctPlayer.id === me?.id ? (
              <>
                <strong>CORRECT</strong>
                <span>You answered first and earned ${question.value}!</span>
              </>
            ) : (
              <>
                <strong>{correctPlayer.name} scored!</strong>
                <span>
                  {correctPlayer.name} answered first and earned $
                  {question.value}!
                </span>
              </>
            )
          ) : (
            <>
              <strong>TIME&apos;S UP</strong>
              <span>No one answered correctly in time.</span>
            </>
          )}
        </div>
      )}

      {isHost && room.hasQuestionBeenAnswered && (
        <button className="next-question-button" onClick={closeQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
}

export default QuestionCard;