import socket from "../socket";

function GameBoard({ questions, roomCode, disabled }) {
  const categories = [...new Set(questions.map((q) => q.category))];

  function selectQuestion(questionId) {
    socket.emit("selectQuestion", {
      roomCode,
      questionId
    });
  }

  return (
    <div className="jeopardy-board">
      {categories.map((category) => (
        <div className="jeopardy-category" key={category}>
          {category}
        </div>
      ))}

      {[100, 200, 300, 400, 500].map((value) =>
        categories.map((category) => {
          const question = questions.find(
            (q) => q.category === category && q.value === value
          );

          return (
            <button
              key={`${category}-${value}`}
              className="jeopardy-tile"
              disabled={disabled || !question || question.used}
              onClick={() => selectQuestion(question.id)}
            >
              {question?.used ? "" : `$${value}`}
            </button>
          );
        })
      )}
    </div>
  );
}

export default GameBoard;