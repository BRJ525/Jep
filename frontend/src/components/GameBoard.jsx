import socket from "../socket";

function GameBoard({
  questions,
  roomCode,
  disabled = false,
  isHost = false,
  chooserId = null,
  chooserName = null,
}) {
  const categories = [...new Set(questions.map((q) => q.category))];
  const values = [100, 200, 300, 400, 500];

  const isChooser = chooserId === socket.id;

  function selectQuestion(questionId) {
    if (!isHost || disabled || !questionId) return;

    socket.emit("selectQuestion", { roomCode, questionId });
  }

  return (
    <div className={`board-shell ${isHost ? "host-board" : ""}`}>
      <div className="board-top">
        <div className="chooser-info">
          <span className="chooser-badge">CHOOSING</span>

          <p>
            {isHost
              ? chooserName
                ? `Ask ${chooserName} which question they want.`
                : "Waiting for a chooser."
              : isChooser
                ? "You are choosing. Tell the host which question you want."
                : chooserName
                  ? `${chooserName} is choosing the next question.`
                  : "Waiting for a chooser."}
          </p>
        </div>
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

            // Do not disable player tiles just because they are not host.
            // That keeps them blue instead of gray/black.
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