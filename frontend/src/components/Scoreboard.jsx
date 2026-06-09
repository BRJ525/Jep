import coinIcon from "../assets/coin.png";

function Scoreboard({ players, showAnswerStatus = false, chooserId = null }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h2>Scores {players.length}/10</h2>

      <div className="score-list">
        {sortedPlayers.map((player, index) => {
          const isChooser = player.id === chooserId;

          return (
            <div
              className={`score-row ${isChooser ? "chooser-player" : ""}`}
              key={player.id}
            >
              <span className="rank">#{index + 1}</span>

              <div className="player-score-info">
                <span className="player-name">
                  {player.name}
                  {isChooser && (
                    <span className="mini-chooser-badge">CHOOSING</span>
                  )}
                </span>

                {showAnswerStatus ? (
                  <span className="answer-status">
                    {player.hasAnswered || player.selectedAnswer
                      ? "Answered"
                      : "Waiting..."}
                  </span>
                ) : (
                  <span className="player-role">Player</span>
                )}
              </div>

              <span className="score-value">
                <img src={coinIcon} alt="" />
                {player.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Scoreboard;