import { useState } from "react";
import socket from "../socket";
import headerImage from "../assets/jeopardee.png";

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

    console.log("Create room clicked");
    console.log("Socket connected?", socket.connected);
    console.log("Socket id:", socket.id);

    socket.off("roomCreated");
    socket.off("roomError");

    socket.once("roomCreated", (room) => {
      console.log("Room created:", room);

      setPlayerName(name.trim());
      setRoomCode(room.roomCode);
      setRoom(room);
      setScreen("lobby");
    });

    socket.once("roomError", (message) => {
      console.log("Room error:", message);
      setError(message);
    });

    socket.emit("createRoom", {
      playerName: name.trim()
    });
  }

  function joinRoom() {
      if (!requireName()) return;

      if (!roomInput.trim()) {
        setError("Please enter a room code.");
        return;
      }

      setError("");

      socket.off("roomJoined");
      socket.off("roomError");

      socket.once("roomJoined", (room) => {
        setPlayerName(name.trim());
        setRoomCode(room.roomCode);
        setRoom(room);
        setScreen("lobby");
      });

      socket.once("roomError", (message) => {
        console.log("Room error:", message);
        setError(message);
      });

      socket.emit("joinRoom", {
        playerName: name.trim(),
        roomCode: roomInput.trim().toUpperCase()
      });
    }

 return (
    <div className="home-screen">
      <div className="home-bg-glow home-bg-glow-one"></div>
      <div className="home-bg-glow home-bg-glow-two"></div>

      <div className="home-stage">
        <img
          className="home-header-img"
          src={headerImage}
          alt="Jeopardee"
        />

        <div className="home-card">
          <div className="home-card-top">
            <h2>Welcome</h2>
            <p>Host a match or join with a room code.</p>
          </div>

          <div className="home-form">
            <label>Your Name</label>

            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button className="primary-btn" onClick={createRoom}>
              Create Room
            </button>

            {!showJoinBox && (
              <button
                className="secondary-btn"
                onClick={() => setShowJoinBox(true)}
              >
                Join Room
              </button>
            )}

            {showJoinBox && (
              <div className="join-box">
                <label>Room Code</label>

                <input
                  placeholder="Enter room code"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                />

                <button className="secondary-btn" onClick={joinRoom}>
                  Join Game
                </button>
              </div>
            )}

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;