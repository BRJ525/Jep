import socket from "../socket";

function GameBoard({ questions, roomCode, disabled = false, isHost = false }) {
  const categories = [...new Set(questions.map((q) => q.category))];
  const values = [100, 200, 300, 400, 500];

  function selectQuestion(questionId) {
    if (!isHost || disabled || !questionId) return;

    socket.emit("selectQuestion", { roomCode, questionId });
  }

  return (
    <div className={`board-shell ${isHost ? "host-board" : ""}`}>
      <div className="board-top">
        <p>
          {isHost
            ? "Pick a category and value to reveal the question."
            : "Waiting for the host to pick a question."}
        </p>
      </div>

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

            // Important:
            // Do NOT disable player tiles just because they are not host.
            // Disabled buttons turn gray/black in the browser/CSS.
            const isDisabled = !question || isUsed;

            return (
              <button
                className={`jeopardy-tile ${isUsed ? "used-tile" : ""}`}
                key={`${category}-${value}`}
                disabled={isDisabled}
                onClick={() => selectQuestion(question?.id)}
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