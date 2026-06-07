function Players({ players, room }) {
  return (
    <div className="players lobby-players">
      <h3>Players</h3>

      {players.map((player) => (
        <div className="player-row" key={player.id}>
          <span>{player.name}</span>

          <div className="player-tags">
            {player.id === room?.hostId && <span className="host-tag">HOST</span>}
            {player.selectedAnswer && <span className="answered-tag">ANSWERED</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Players;