function Players({ players }) {
  return (
    <div className="players lobby-players">
      <h3>Players</h3>

      {players.length === 0 ? (
        <div className="waiting-box">Waiting for players to join...</div>
      ) : (
        players.map((player) => (
          <div className="player-row" key={player.id}>
            <span>{player.name}</span>

            <div className="player-tags">
              {player.hasAnswered || player.selectedAnswer ? (
                <span className="answered-tag">ANSWERED</span>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Players;