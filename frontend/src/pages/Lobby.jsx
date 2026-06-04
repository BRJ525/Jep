import socket from "../socket";
import Players from "../components/Players";

function Lobby({ roomCode, room }) {
  const me = room?.players.find((p) => p.id === socket.id);
  const isHost = room?.hostId === socket.id;

  function startGame() {
    socket.emit("startGame", { roomCode });
  }

  return (
    <div className="app-bg">
      <div className="lobby-card">
        <h1>Lobby</h1>
        <p className="room-code">Room Code: {roomCode}</p>

        <Players
          players={room?.players || []}
          room={room}
        />

        <p>{room?.players.length || 0}/4 players in the lobby</p>

        {isHost ? (
          <button onClick={startGame}>Start Game</button>
        ) : (
          <p>Waiting for host to start the game...</p>
        )}
      </div>
    </div>
  );
}

export default Lobby;