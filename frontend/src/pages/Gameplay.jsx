import { useEffect } from "react";
import socket from "../socket";
import GameBoard from "../components/GameBoard";
import Scoreboard from "../components/Scoreboard";
import QuestionCard from "../components/QuestionCard";
import jeopardeeLogo from "../assets/jeopardee.png";

function Gameplay({ setScreen, roomCode, room, setRoom }) {
  const isHost = room?.hostId === socket.id;

  useEffect(() => {
    socket.on("roomUpdated", setRoom);

    return () => {
      socket.off("roomUpdated", setRoom);
    };
  }, [setRoom]);

  if (!room) {
    return (
      <div className="home-screen">
        <div className="home-stage">
          <div className="home-card">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen gameplay-screen">
      <div className="home-bg-glow home-bg-glow"></div>
      <div className="home-bg-glow home-bg-glow"></div>

      <div className="gameplay-stage">
        <div className="gameplay-header">
          <div className="gameplay-brand">
            <img
              src={jeopardeeLogo}
              alt="Jeopardee"
              className="game-logo-img"
            />

            <div className="room-pill">
              <span>Room</span>
              <strong>{roomCode}</strong>
            </div>
          </div>

          <button className="leave-btn" onClick={() => setScreen("home")}>
            Leave
          </button>
        </div>

        <div className="gameplay-layout">
          <div className="gameplay-main">
            {room.currentQuestion ? (
              <QuestionCard
                question={room.currentQuestion}
                room={room}
                roomCode={roomCode}
                isHost={isHost}
              />
            ) : (
              <GameBoard
                questions={room.questions}
                roomCode={roomCode}
                disabled={false}
              />
            )}
          </div>

          <div className="gameplay-side">
            <Scoreboard players={room.players} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gameplay;