function Scoreboard({ players }) {
  return (
    <div className="scoreboard">
      <h2>Scores</h2>

      {players.map((player) => (
        <p key={player.id}>
          {player.name}: ${player.score}
        </p>
      ))}
    </div>
  );
}

export default Scoreboard;