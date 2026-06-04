import { useEffect, useState } from "react";
import socket from "./socket";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Gameplay from "./pages/Gameplay";

function App() {
  const [screen, setScreen] = useState("home");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.on("roomUpdated", (updatedRoom) => {
      console.log("ROOM UPDATED:", updatedRoom);
      setRoom(updatedRoom);
    });

    socket.on("gameStarted", (updatedRoom) => {
      setRoom(updatedRoom);
      setScreen("gameplay");
    });

    return () => {
      socket.off("roomUpdated");
      socket.off("gameStarted");
    };
  }, []);

  if (screen === "home") {
    console.log("Rooms after create:", rooms);
    return (
      <Home
        setScreen={setScreen}
        setPlayerName={setPlayerName}
        setRoomCode={setRoomCode}
        setRoom={setRoom}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <Lobby
        setScreen={setScreen}
        playerName={playerName}
        roomCode={roomCode}
        room={room}
        setRoom={setRoom}
      />
    );
  }

  return (
    <Gameplay
      setScreen={setScreen}
      playerName={playerName}
      roomCode={roomCode}
      room={room}
      setRoom={setRoom}
    />
  );
}

export default App;