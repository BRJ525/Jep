import coinIcon from "../assets/coin.png";

function WinnerScreen({ players = [], onBackToMenu }) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <div className="winner-screen">
            <div className="winner-card">
                <h1>Game Over</h1>

                {winner && (
                    <div className="winner-section">
                        <p className="winner-label">Winner</p>
                        <h2>{winner.name}</h2>

                        <div className="winner-score">
                            <img src={coinIcon} alt="coins" />
                            <span>{winner.score}</span>
                        </div>
                    </div>
                )}

                <div className="final-standings">
                    <h3>Final Standings</h3>

                    <div className="standings-list">
                        {sortedPlayers.map((player, index) => (
                            <div className="standing-row" key={player.id}>
                                <div className="standing-left">
                                    <span className="standing-rank">#{index + 1}</span>
                                    <span className="standing-name">{player.name}</span>
                                </div>

                                <div className="standing-score">
                                    <img src={coinIcon} alt="coins" />
                                    <span>{player.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="back-menu-button" onClick={onBackToMenu}>
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
}

export default WinnerScreen;