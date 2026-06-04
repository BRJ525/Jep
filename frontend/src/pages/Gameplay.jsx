import { useEffect } from "react";
import socket from "../socket";
import GameBoard from "../components/GameBoard";
import Scoreboard from "../components/Scoreboard";
import QuestionCard from "../components/QuestionCard";
import Players from "../components/Players";

function Gameplay({ setScreen, roomCode, room, setRoom }) {
  const me = room?.players.find((p) => p.id === socket.id);
  const isHost = room?.hostId === socket.id;

  useEffect(() => {
    socket.on("roomUpdated", setRoom);

    return () => {
      socket.off("roomUpdated", setRoom);
    };
  }, [setRoom]);

  if (!room) {
    return <div className="app-bg">Loading...</div>;
  }

  return (
    <div className="game-layout">
      <aside className="side-panel">
        <h2>Room {roomCode}</h2>
        <Scoreboard players={room.players} />
        <Players players={room.players} />
        <button className="small-button" onClick={() => setScreen("home")}>
          Leave
        </button>
      </aside>

      <main className="main-game">
        <h1>Jeopardy Arena</h1>

        <GameBoard
          questions={room.questions}
          roomCode={roomCode}
          disabled={room.currentQuestion}
        />

        {room.currentQuestion && (
          <QuestionCard
            question={room.currentQuestion}
            room={room}
            roomCode={roomCode}
            isHost={isHost}
          />
        )}
      </main>
    </div>
  );
}

export default Gameplay;