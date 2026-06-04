function Players({ players, room }) {
  return (
    <div className="panel-box">
      <h3>Players</h3>

      {players.map((player) => (
        <div className="player-row" key={player.id}>
          <span>
            {player.name} {player.id === room.hostId && "[HOST]"}
          </span>

          {player.selectedAnswer && <span className="buzz-tag">Answered</span>}
        </div>
      ))}
    </div>
  );
}

export default Players;