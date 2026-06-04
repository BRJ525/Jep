import { useState } from "react";
import socket from "../socket";

function Home({ setScreen, setPlayerName, setRoomCode, setRoom }) {
  const [name, setName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [showJoinBox, setShowJoinBox] = useState(false);
  const [error, setError] = useState("");

  function requireName() {
    if (!name.trim()) {
      setError("Please enter your name first.");
      return false;
    }

    setError("");
    return true;
  }

  function createRoom() {
    if (!requireName()) return;

    socket.emit("createRoom", {
      playerName: name.trim()
    });

    socket.once("roomCreated", (room) => {
      setPlayerName(name.trim());
      setRoomCode(room.roomCode);
      setRoom(room);
      setScreen("lobby");
    });

    socket.once("roomError", (message) => {
      setError(message);
    });
  }

  function joinRoom() {
    if (!requireName()) return;

    if (!roomInput.trim()) {
      setError("Please enter a room code.");
      return;
    }

    socket.emit("joinRoom", {
      playerName: name.trim(),
      roomCode: roomInput.trim().toUpperCase()
    });

    socket.once("roomJoined", (room) => {
      setPlayerName(name.trim());
      setRoomCode(room.roomCode);
      setRoom(room);
      setScreen("lobby");
    });

    socket.once("roomError", (message) => {
      setError(message);
    });
  }

  return (
    <div className="app-bg">
      <div className="home-card">
        <h1>Jeopardy Arena</h1>

        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={createRoom}>Create Room</button>

        <button onClick={() => setShowJoinBox(true)}>
          Join Room
        </button>

        {showJoinBox && (
          <>
            <input
              placeholder="Enter room code"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            />

            <button onClick={joinRoom}>Join</button>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Home;