import socket from "../socket";

function GameBoard({ questions, roomCode, disabled }) {
  const categories = [...new Set(questions.map((q) => q.category))];
  const values = [100, 200, 300, 400, 500];

  function selectQuestion(questionId) {
    if (disabled || !questionId) return;
    socket.emit("selectQuestion", { roomCode, questionId });
  }

  return (
    <div className="board-shell">

      <div
        className="jeopardy-board"
        style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
      >
        {categories.map((category) => (
          <div className="jeopardy-category" key={category}>
            {category}
          </div>
        ))}

        {values.map((value) =>
          categories.map((category) => {
            const question = questions.find(
              (q) => q.category === category && q.value === value
            );

            const isUsed = question?.used;
            const isDisabled = disabled || !question || isUsed;

            return (
              <button
                className={`jeopardy-tile ${isUsed ? "used-tile" : ""}`}
                key={`${category}-${value}`}
                disabled={isDisabled}
                onClick={() => selectQuestion(question.id)}
              >
                {!isUsed && question && (
                  <span className="tile-value">${value}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GameBoard;