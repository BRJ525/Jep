import coinIcon from "../assets/coin.png";

function Scoreboard({ players, showAnswerStatus = false, chooserId = null }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard polished-scoreboard">
      <div className="scoreboard-header">
        <span>Scores</span>
      </div>

      <div className="score-list">
        {sortedPlayers.map((player, index) => {
          const isChooser = player.id === chooserId;

          return (
            <div
              className={`score-row ${isChooser ? "chooser-player" : ""}`}
              key={player.id}
            >
              <div className="player-left">
                <div className="rank-badge">#{index + 1}</div>

                <div className="player-info">
                  <span className="score-name">
                    {player.name}

                    {isChooser && (
                      <span className="mini-chooser-badge">CHOOSING</span>
                    )}
                  </span>

                  {showAnswerStatus ? (
                    <small>
                      {player.hasAnswered || player.selectedAnswer ? (
                        <span className="answered-indicator">Answered</span>
                      ) : (
                        <span className="waiting-indicator">Waiting...</span>
                      )}
                    </small>
                  ) : (
                    <small>Player</small>
                  )}
                </div>
              </div>

              <div className="score-amount">
                <img src={coinIcon} alt="coins" className="coin-icon" />
                <span>{player.score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Scoreboard;