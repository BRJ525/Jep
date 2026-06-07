import socket from "../socket";
import Players from "../components/Players";

function Lobby({ roomCode, room }) {
  const isHost = room?.hostId === socket.id;

  function startGame() {
    socket.emit("startGame", { roomCode });
  }

  return (
    <div className="home-screen lobby-screen">

      <div className="home-stage">
        <div className="home-card lobby-card">
          <div className="home-card-top">
            <h2>Lobby</h2>
            <p>Share the room code with your friends.</p>
          </div>

          <div className="room-code-box">
            <span>Room Code</span>
            <strong>{roomCode}</strong>
          </div>

          <div className="lobby-status">
            {room?.players.length || 0}/4 Players
          </div>

          <Players players={room?.players || []} room={room} />

          {isHost ? (
            <button className="primary-btn" onClick={startGame}>
              Start Game
            </button>
          ) : (
            <div className="waiting-box">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lobby;