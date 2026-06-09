import { useEffect, useState } from "react";
import socket from "../socket";
import GameBoard from "../components/GameBoard";
import Scoreboard from "../components/Scoreboard";
import QuestionCard from "../components/QuestionCard";
import WinnerScreen from "./WinnerScreen";
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

  const usedQuestionCount =
    room.questions?.filter((question) => question.used).length || 0;

  const isGameOver = usedQuestionCount >= 1 && !room.currentQuestion;

  return (
    <div className="gameplay-screen">
      <header className="gameplay-header">
        <img src={jeopardeeLogo} alt="Jeopardee" className="gameplay-logo" />

        <div className="gameplay-room-info">
          <span>ROOM</span>
          <strong>{roomCode}</strong>
        </div>
      </header>

      <main className="gameplay-layout">
        <section className="gameplay-stage">
          {isGameOver ? (
            <WinnerScreen
              players={room.players}
              onBackToMenu={() => setScreen("home")}
            />
          ) : room.currentQuestion ? (
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
              chooserId={room.chooserId}
              chooserName={room.chooserName}
            />
          )}
        </section>

        <aside className="gameplay-sidebar">
          <Scoreboard
            players={room.players}
            chooserId={room.chooserId}
            showAnswerStatus={Boolean(room.currentQuestion)}
          />
        </aside>
      </main>
    </div>
  );
}

export default Gameplay;