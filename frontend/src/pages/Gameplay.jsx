import { useEffect, useState } from "react";
import socket from "../socket";
import GameBoard from "../components/GameBoard";
import Scoreboard from "../components/Scoreboard";
import QuestionCard from "../components/QuestionCard";
import jeopardeeLogo from "../assets/jeopardee.png";

function Gameplay({ setScreen, roomCode, room, setRoom }) {
  const isHost = room?.hostId === socket.id;

  const [timer, setTimer] = useState({
    timeLeft: 10,
    totalTime: 10,
  });

  useEffect(() => {
    socket.on("roomUpdated", setRoom);
    socket.on("questionTimer", setTimer);

    return () => {
      socket.off("roomUpdated", setRoom);
      socket.off("questionTimer", setTimer);
    };
  }, [setRoom]);

  if (!room) {
    return (
      <div className="gameplay-screen">
        <div className="gameplay-stage">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="gameplay-screen">
      <div className="gameplay-stage">
        <header className="gameplay-header">
          <div className="gameplay-brand">
            <img src={jeopardeeLogo} alt="Jeopardee" className="gameplay-logo" />
          </div>

          <div className="room-code-pill">Room {roomCode}</div>

          <button className="leave-button" onClick={() => setScreen("home")}>
            Leave
          </button>
        </header>

        <main className="gameplay-layout">
          <section className="gameplay-main">
            {room.currentQuestion ? (
              <QuestionCard
                question={room.currentQuestion}
                room={room}
                roomCode={roomCode}
                isHost={isHost}
                timer={timer}
              />
            ) : (
                <GameBoard
                  questions={room.questions}
                  roomCode={roomCode}
                  disabled={false}
                  isHost={isHost}
                />
            )}
          </section>

          <aside className="gameplay-sidebar">
            <Scoreboard
              players={room.players}
              showAnswerStatus={
                Boolean(room.currentQuestion) && !room.hasQuestionBeenAnswered
              }
            />
          </aside>
        </main>
      </div>
    </div>
  );
}

export default Gameplay;